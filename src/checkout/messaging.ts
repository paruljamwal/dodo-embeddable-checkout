import { checkoutMessageSource, checkoutMessageTypes } from '../constants/checkout.ts'
import { isOpenCheckoutMessage, type CheckoutToSdkMessage } from '../types/messages.ts'

function readParentOrigin(): string | null {
  if (window.parent === window) return null

  try {
    return new URL(window.parent.location.href).origin
  } catch {
    if (!document.referrer) return null

    try {
      return new URL(document.referrer).origin
    } catch {
      return null
    }
  }
}

export function postToSdk(message: CheckoutToSdkMessage): void {
  const origin = readParentOrigin()
  if (!origin) return

  window.parent.postMessage(message, origin)
}

export function connectCheckoutFrame(onProductId: (productId: string) => void): () => void {
  function handleMessage(event: MessageEvent): void {
    const origin = readParentOrigin()
    if (!origin || event.origin !== origin || event.source !== window.parent) return
    if (!isOpenCheckoutMessage(event.data)) return

    onProductId(event.data.payload.productId)
  }

  window.addEventListener('message', handleMessage)
  postToSdk({
    source: checkoutMessageSource,
    type: checkoutMessageTypes.ready,
  })

  return () => window.removeEventListener('message', handleMessage)
}
