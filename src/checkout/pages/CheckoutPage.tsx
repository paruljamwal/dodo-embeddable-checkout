import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { CheckoutHeader } from '../components/CheckoutHeader.tsx'
import { CheckoutLayout } from '../components/CheckoutLayout.tsx'
import { EmailForm } from '../components/EmailForm.tsx'
import { ProductSummary } from '../components/ProductSummary.tsx'
import { getEmailError } from '../email.ts'
import { mockProduct } from '../product.ts'
import '../checkout.css'

const checkoutSteps = {
  details: 'details',
  payment: 'payment',
} as const

type CheckoutStep = (typeof checkoutSteps)[keyof typeof checkoutSteps]

export function CheckoutPage() {
  const [step, setStep] = useState<CheckoutStep>(checkoutSteps.details)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const paymentHeadingRef = useRef<HTMLHeadingElement>(null)

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
        ) : (
          <>
            <h1 ref={paymentHeadingRef} className="checkout-step-heading" tabIndex={-1}>
              Payment
            </h1>
            <p className="checkout-lede">You'll enter your card here.</p>
            <ProductSummary product={mockProduct} />
            <button type="button" className="checkout-back" onClick={handleBack}>
              Back to email
            </button>
            <p className="checkout-trust">Card details stay in this checkout.</p>
          </>
        )}
      </main>
    </CheckoutLayout>
  )
}
