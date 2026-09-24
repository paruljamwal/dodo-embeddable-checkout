import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { CheckoutHeader } from '../components/CheckoutHeader.tsx'
import { CheckoutLayout } from '../components/CheckoutLayout.tsx'
import { EmailForm } from '../components/EmailForm.tsx'
import { PaymentForm } from '../components/PaymentForm.tsx'
import { PaymentSuccess } from '../components/PaymentSuccess.tsx'
import { ProductSummary } from '../components/ProductSummary.tsx'
import { getEmailError } from '../email.ts'
import { mockProduct } from '../product.ts'
import { simulatePayment, type PaymentResult } from '../simulatePayment.ts'
import '../checkout.css'

const checkoutSteps = {
  details: 'details',
  payment: 'payment',
} as const

type CheckoutStep = (typeof checkoutSteps)[keyof typeof checkoutSteps]

type PaymentNotice = 'declined' | 'processor' | 'network'

function paymentStatusMessage(notice: PaymentNotice | null): string | null {
  if (notice === 'declined') return 'Your payment was declined.'
  if (notice === 'network') return "We couldn't complete the payment. Try again."
  if (notice === 'processor') return "Your payment couldn't be completed. Try again."
  return null
}

export function CheckoutPage() {
  const [step, setStep] = useState<CheckoutStep>(checkoutSteps.details)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isPaying, setIsPaying] = useState(false)
  const [paymentNotice, setPaymentNotice] = useState<PaymentNotice | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const paymentHeadingRef = useRef<HTMLHeadingElement>(null)
  const payingRef = useRef(false)

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
      setStep(checkoutSteps.payment)
    })
    paymentHeadingRef.current?.focus()
  }

  async function handlePay() {
    if (payingRef.current) return

    payingRef.current = true
    setIsPaying(true)
    setPaymentNotice(null)

    try {
      const simulation = await simulatePayment({
        cardNumber,
        failedAttempts,
      })

      setFailedAttempts(simulation.failedAttempts)
      applyPaymentResult(simulation.result)
    } finally {
      payingRef.current = false
      setIsPaying(false)
    }
  }

  function applyPaymentResult(result: PaymentResult) {
    if (result.status === 'success') {
      setTransactionId(result.transactionId)
      return
    }

    if (result.status === 'declined') {
      setPaymentNotice('declined')
      return
    }

    setPaymentNotice(result.cause === 'network' ? 'network' : 'processor')
  }

  function handleBack() {
    flushSync(() => {
      setStep(checkoutSteps.details)
    })
    emailInputRef.current?.focus()
  }

  return (
    <CheckoutLayout>
      <CheckoutHeader />
      <main className="checkout-main">
        {step === checkoutSteps.details ? (
          <>
            <h1>Complete your purchase</h1>
            <p className="checkout-lede">
              You'll pay on this page. The store never receives your card.
            </p>
            <ProductSummary product={mockProduct} />
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
        ) : transactionId ? (
          <PaymentSuccess product={mockProduct} transactionId={transactionId} />
        ) : (
          <>
            <h1 ref={paymentHeadingRef} className="checkout-step-heading" tabIndex={-1}>
              Payment
            </h1>
            <ProductSummary product={mockProduct} />
            <PaymentForm
              product={mockProduct}
              cardNumber={cardNumber}
              expiry={expiry}
              cvc={cvc}
              isPaying={isPaying}
              statusMessage={paymentStatusMessage(paymentNotice)}
              onCardNumberChange={setCardNumber}
              onExpiryChange={setExpiry}
              onCvcChange={setCvc}
              onPay={handlePay}
            />
            <button type="button" className="checkout-back" onClick={handleBack} disabled={isPaying}>
              Back to email
            </button>
            <p className="checkout-trust">Card details stay in this checkout.</p>
          </>
        )}
      </main>
    </CheckoutLayout>
  )
}
