import { errorCodes, getCheckoutFrameUrl } from '../constants/checkout.ts'
import { createCheckoutModal } from './modal.ts'
import type { CheckoutFailure, OpenCheckoutOptions } from './types.ts'

type PageScrollLock = {
  bodyOverflow: string
  bodyPosition: string
  bodyTop: string
  bodyLeft: string
  bodyRight: string
  bodyWidth: string
  scrollY: number
}

type CheckoutSession = {
  options: OpenCheckoutOptions
  backdrop: HTMLDivElement
  iframe: HTMLIFrameElement
  scrollLock: PageScrollLock
  onKeyDown: (event: KeyboardEvent) => void
}

let session: CheckoutSession | null = null

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function configurationError(value: unknown): CheckoutFailure | null {
  if (!isRecord(value)) {
    return {
      code: errorCodes.invalidConfiguration,
      message: 'Checkout options are required.',
    }
  }

  if (typeof value.productId !== 'string' || value.productId.trim().length === 0) {
    return {
      code: errorCodes.invalidConfiguration,
      message: 'A product ID is required.',
    }
  }

  if (
    typeof value.onSuccess !== 'function' ||
    typeof value.onClose !== 'function' ||
    typeof value.onError !== 'function'
  ) {
    return {
      code: errorCodes.invalidConfiguration,
      message: 'Checkout callbacks must be functions.',
    }
  }

  return null
}

function reportConfigurationError(value: unknown, error: CheckoutFailure): void {
  if (!isRecord(value) || typeof value.onError !== 'function') return

  const onError = value.onError as OpenCheckoutOptions['onError']
  onError(error)
}

function lockPageScroll(): PageScrollLock {
  const scrollY = window.scrollY
  const scrollLock = {
    bodyOverflow: document.body.style.overflow,
    bodyPosition: document.body.style.position,
    bodyTop: document.body.style.top,
    bodyLeft: document.body.style.left,
    bodyRight: document.body.style.right,
    bodyWidth: document.body.style.width,
    scrollY,
  }

  document.body.style.overflow = 'hidden'
  // overflow: hidden alone does not stop viewport scrolling.
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'

  return scrollLock
}

function restorePageScroll(scrollLock: PageScrollLock): void {
  document.body.style.overflow = scrollLock.bodyOverflow
  document.body.style.position = scrollLock.bodyPosition
  document.body.style.top = scrollLock.bodyTop
  document.body.style.left = scrollLock.bodyLeft
  document.body.style.right = scrollLock.bodyRight
  document.body.style.width = scrollLock.bodyWidth
  window.scrollTo(0, scrollLock.scrollY)
}

function closeCheckout(): void {
  const current = session
  if (!current) return

  session = null
  document.removeEventListener('keydown', current.onKeyDown)
  restorePageScroll(current.scrollLock)
  current.iframe.remove()
  current.backdrop.remove()
}

function onEscape(event: KeyboardEvent): void {
  if (event.key !== 'Escape' || !session) return

  event.preventDefault()
  closeCheckout()
}

function open(options: OpenCheckoutOptions): void {
  if (session) return

  const error = configurationError(options)
  if (error) {
    reportConfigurationError(options, error)
    return
  }

  try {
    const modal = createCheckoutModal(getCheckoutFrameUrl())

    session = {
      options,
      backdrop: modal.backdrop,
      iframe: modal.iframe,
      scrollLock: lockPageScroll(),
      onKeyDown: onEscape,
    }

    document.body.appendChild(modal.backdrop)
    // Keys typed inside the iframe do not reach the parent document.
    document.addEventListener('keydown', onEscape)
    modal.backdrop.tabIndex = -1
    modal.backdrop.focus()
  } catch {
    closeCheckout()
    options.onError({
      code: errorCodes.checkoutLoadFailed,
      message: 'Checkout could not be opened.',
    })
  }
}

export const DodoCheckout = {
  open,
}

declare global {
  interface Window {
    DodoCheckout: typeof DodoCheckout
  }
}

window.DodoCheckout = DodoCheckout
