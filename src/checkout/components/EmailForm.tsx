import type { FormEvent, RefObject } from 'react'
import { getEmailError } from '../email.ts'

const emailFieldId = 'checkout-email'
const emailErrorId = 'checkout-email-error'

type EmailFormProps = {
  email: string
  error: string | null
  inputRef: RefObject<HTMLInputElement | null>
  onEmailChange: (value: string) => void
  onEmailBlur: (value: string) => void
  onContinue: () => void
}

export function EmailForm({
  email,
  error,
  inputRef,
  onEmailChange,
  onEmailBlur,
  onContinue,
}: EmailFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onContinue()
  }

  return (
    <form className="checkout-email" noValidate onSubmit={handleSubmit}>
      <div className="checkout-field">
        <label className="checkout-label" htmlFor={emailFieldId}>
          Email
        </label>
        <input
          ref={inputRef}
          id={emailFieldId}
          className="checkout-input"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="you@example.com"
          required
          value={email}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? emailErrorId : undefined}
          onChange={(event) => onEmailChange(event.target.value)}
          onBlur={(event) => onEmailBlur(event.currentTarget.value)}
        />
        {error ? (
          <p className="checkout-error" id={emailErrorId} role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <button
        className="checkout-primary"
        type="submit"
        disabled={getEmailError(email) !== null}
      >
        Continue to payment
      </button>
    </form>
  )
}
