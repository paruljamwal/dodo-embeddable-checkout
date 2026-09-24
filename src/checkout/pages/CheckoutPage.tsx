import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { CheckoutHeader } from '../components/CheckoutHeader.tsx'
import { CheckoutLayout } from '../components/CheckoutLayout.tsx'
import { EmailForm } from '../components/EmailForm.tsx'
import { PaymentForm } from '../components/PaymentForm.tsx'
import { PaymentSuccess } from '../components/PaymentSuccess.tsx'
import { ProductSummary } from '../components/ProductSummary.tsx'
import {
  checkoutMessageSource,
  checkoutMessageTypes,
  closeReasons,
  errorCodes,
  type CloseReason,
} from '../../constants/checkout.ts'
import { getEmailError } from '../email.ts'
import { connectCheckoutFrame, postToSdk } from '../messaging.ts'
import { findProduct, mockProduct, type Product } from '../product.ts'
import { simulatePayment } from '../simulatePayment.ts'
import type { CheckoutFailure } from '../../sdk/types.ts'
import '../checkout.css'

const checkoutStatus = {
  email: 'email',
  payment: 'payment',
  processing: 'processing',
  success: 'success',
  failed: 'failed',
  closed: 'closed',
} as const

type FailureCause = 'declined' | 'processor' | 'network'

type ProductLoad =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'ready'; product: Product }

type CheckoutState =
  | { status: typeof checkoutStatus.email }
  | { status: typeof checkoutStatus.payment }
  | { status: typeof checkoutStatus.processing }
  | { status: typeof checkoutStatus.success; transactionId: string }
  | { status: typeof checkoutStatus.failed; cause: FailureCause }
  | { status: typeof checkoutStatus.closed; reason: CloseReason }

function failureMessage(cause: FailureCause): string {
  if (cause === 'declined') return 'Your payment was declined.'
  if (cause === 'network') return "We couldn't complete the payment. Try again."
  return "Your payment couldn't be completed. Try again."
}

function paymentFailure(cause: FailureCause): CheckoutFailure {
  if (cause === 'declined') {
    return { code: errorCodes.paymentDeclined, message: failureMessage(cause) }
  }

  if (cause === 'network') {
    return { code: errorCodes.communicationFailed, message: failureMessage(cause) }
  }

  return { code: errorCodes.paymentFailed, message: failureMessage(cause) }
}

function showsPaymentForm(state: CheckoutState): boolean {
  return (
    state.status === checkoutStatus.payment ||
    state.status === checkoutStatus.processing ||
    state.status === checkoutStatus.failed
  )
}

export function CheckoutPage() {
  const [productLoad, setProductLoad] = useState<ProductLoad>(() =>
    window.parent === window ? { status: 'ready', product: mockProduct } : { status: 'loading' },
  )
  const [state, setState] = useState<CheckoutState>({ status: checkoutStatus.email })
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const paymentHeadingRef = useRef<HTMLHeadingElement>(null)
  const statusMessageRef = useRef<HTMLParagraphElement>(null)
  const closedHeadingRef = useRef<HTMLHeadingElement>(null)
  const payingRef = useRef(false)
  const requestIdRef = useRef(0)

  const failureCause = state.status === checkoutStatus.failed ? state.cause : ''

  useEffect(() => {
    return connectCheckoutFrame((productId) => {
      const product = findProduct(productId)
      setProductLoad(product ? { status: 'ready', product } : { status: 'missing' })
    })
  }, [])

  useEffect(() => {
    if (productLoad.status !== 'ready' || window.parent === window) return
    emailInputRef.current?.focus()
  }, [productLoad.status])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (state.status === checkoutStatus.processing || state.status === checkoutStatus.success) return

      event.preventDefault()
      handleClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state.status])

  useEffect(() => {
    if (!failureCause) return
    statusMessageRef.current?.focus()
  }, [failureCause])

  useEffect(() => {
    if (state.status !== checkoutStatus.closed) return
    closedHeadingRef.current?.focus()
  }, [state.status])

  function handleEmailChange(value: string) {
    setEmail(value)

    if (emailError) {
      setEmailError(getEmailError(value))
    }
  }

  function handleEmailBlur(value: string) {
    setEmailError(getEmailError(value))
  }

  function handleContinue() {
    const nextError = getEmailError(email)

    if (nextError) {
      setEmailError(nextError)
      emailInputRef.current?.focus()
      return
    }

    flushSync(() => {
      setState({ status: checkoutStatus.payment })
    })
    paymentHeadingRef.current?.focus()
  }

  async function handlePay() {
    if (productLoad.status !== 'ready') return
    if (payingRef.current || state.status === checkoutStatus.processing) return

    const product = productLoad.product

    payingRef.current = true
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setState({ status: checkoutStatus.processing })

    try {
      const simulation = await simulatePayment({
        cardNumber,
        failedAttempts,
      })

      if (requestId !== requestIdRef.current) return

      setFailedAttempts(simulation.failedAttempts)

      if (simulation.result.status === 'success') {
        setState({
          status: checkoutStatus.success,
          transactionId: simulation.result.transactionId,
        })
        postToSdk({
          source: checkoutMessageSource,
          type: checkoutMessageTypes.paymentSucceeded,
          payload: {
            transactionId: simulation.result.transactionId,
            productId: product.id,
          },
        })
        return
      }

      const cause: FailureCause =
        simulation.result.status === 'declined'
          ? 'declined'
          : simulation.result.cause === 'network'
            ? 'network'
            : 'processor'

      setState({ status: checkoutStatus.failed, cause })
      postToSdk({
        source: checkoutMessageSource,
        type: checkoutMessageTypes.paymentFailed,
        payload: paymentFailure(cause),
      })
    } finally {
      if (requestId === requestIdRef.current) {
        payingRef.current = false
      }
    }
  }

  function handleBack() {
    if (state.status === checkoutStatus.processing || state.status === checkoutStatus.success) return

    flushSync(() => {
      setState({ status: checkoutStatus.email })
    })
    emailInputRef.current?.focus()
  }

  function handleClose() {
    if (state.status === checkoutStatus.processing || state.status === checkoutStatus.success) return

    requestIdRef.current += 1
    payingRef.current = false
    postToSdk({
      source: checkoutMessageSource,
      type: checkoutMessageTypes.closed,
      payload: { reason: closeReasons.userClosed },
    })
    setState({ status: checkoutStatus.closed, reason: closeReasons.userClosed })
  }

  function handleDone() {
    postToSdk({
      source: checkoutMessageSource,
      type: checkoutMessageTypes.closed,
      payload: { reason: closeReasons.paymentCompleted },
    })
    setState({ status: checkoutStatus.closed, reason: closeReasons.paymentCompleted })
  }

  const isProcessing = state.status === checkoutStatus.processing
  const showClose = state.status !== checkoutStatus.success && state.status !== checkoutStatus.closed

  if (productLoad.status !== 'ready') {
    return (
      <CheckoutLayout>
        <CheckoutHeader onClose={handleClose} closeDisabled={false} showClose />
        <main className="checkout-main">
          <h1>Complete your purchase</h1>
          <p className="checkout-lede">
            {productLoad.status === 'loading' ? 'Loading checkout…' : 'This product is unavailable.'}
          </p>
        </main>
      </CheckoutLayout>
    )
  }

  const product = productLoad.product

  return (
    <CheckoutLayout>
      <CheckoutHeader onClose={handleClose} closeDisabled={isProcessing} showClose={showClose} />
      <main className="checkout-main">
        {state.status === checkoutStatus.email ? (
          <>
            <h1>Complete your purchase</h1>
            <p className="checkout-lede">
              You'll pay on this page. The store never receives your card.
            </p>
            <ProductSummary product={product} />
            <EmailForm
              email={email}
              error={emailError}
              inputRef={emailInputRef}
              onEmailChange={handleEmailChange}
              onEmailBlur={handleEmailBlur}
              onContinue={handleContinue}
            />
            <p className="checkout-trust">Card details stay in this checkout.</p>
          </>
        ) : null}

        {showsPaymentForm(state) ? (
          <>
            <h1 ref={paymentHeadingRef} className="checkout-step-heading" tabIndex={-1}>
              Payment
            </h1>
            <ProductSummary product={product} />
            <PaymentForm
              product={product}
              cardNumber={cardNumber}
              expiry={expiry}
              cvc={cvc}
              isProcessing={isProcessing}
              statusMessage={state.status === checkoutStatus.failed ? failureMessage(state.cause) : null}
              statusRef={statusMessageRef}
              onCardNumberChange={setCardNumber}
              onExpiryChange={setExpiry}
              onCvcChange={setCvc}
              onPay={handlePay}
            />
            <button
              type="button"
              className="checkout-back"
              onClick={handleBack}
              disabled={isProcessing}
            >
              Back to email
            </button>
            <p className="checkout-trust">Card details stay in this checkout.</p>
          </>
        ) : null}

        {state.status === checkoutStatus.success ? (
          <PaymentSuccess
            product={product}
            transactionId={state.transactionId}
            onDone={handleDone}
          />
        ) : null}

        {state.status === checkoutStatus.closed ? (
          <>
            <h1 ref={closedHeadingRef} className="checkout-step-heading" tabIndex={-1}>
              {state.reason === closeReasons.paymentCompleted ? "You're all set" : 'Checkout closed'}
            </h1>
            <p className="checkout-lede">You can return to the store.</p>
          </>
        ) : null}
      </main>
    </CheckoutLayout>
  )
}
