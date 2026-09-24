import { useLayoutEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, RefObject } from 'react'
import { formatProductPrice, type Product } from '../product.ts'
import {
  applyCardNumberEdit,
  applyCvcEdit,
  applyExpiryEdit,
  getCardNumberError,
  getCvcError,
  getExpiryError,
} from '../../utils/card.ts'

const cardNumberId = 'checkout-card-number'
const expiryId = 'checkout-expiry'
const cvcId = 'checkout-cvc'

type PaymentFieldName = 'cardNumber' | 'expiry' | 'cvc'

type PaymentFormProps = {
  product: Product
  cardNumber: string
  expiry: string
  cvc: string
  isProcessing: boolean
  statusMessage: string | null
  statusRef: RefObject<HTMLParagraphElement | null>
  onCardNumberChange: (value: string) => void
  onExpiryChange: (value: string) => void
  onCvcChange: (value: string) => void
  onPay: () => void
}

type PaymentFieldProps = {
  id: string
  label: string
  value: string
  error: string | null
  autoComplete: string
  placeholder: string
  inputRef: RefObject<HTMLInputElement | null>
  disabled: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
}

function PaymentField({
  id,
  label,
  value,
  error,
  autoComplete,
  placeholder,
  inputRef,
  disabled,
  onChange,
  onBlur,
}: PaymentFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="payment-field">
      <label className="checkout-label" htmlFor={id}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        className="checkout-input"
        name={id}
        type="text"
        inputMode="numeric"
        autoComplete={autoComplete}
        autoCapitalize="none"
        spellCheck={false}
        placeholder={placeholder}
        required
        disabled={disabled}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error ? (
        <p className="checkout-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function PaymentForm({
  product,
  cardNumber,
  expiry,
  cvc,
  isProcessing,
  statusMessage,
  statusRef,
  onCardNumberChange,
  onExpiryChange,
  onCvcChange,
  onPay,
}: PaymentFormProps) {
  const [touched, setTouched] = useState<Record<PaymentFieldName, boolean>>({
    cardNumber: false,
    expiry: false,
    cvc: false,
  })
  const cardNumberRef = useRef<HTMLInputElement>(null)
  const expiryRef = useRef<HTMLInputElement>(null)
  const cvcRef = useRef<HTMLInputElement>(null)
  const pendingCursor = useRef<{ input: HTMLInputElement; cursor: number } | null>(null)

  useLayoutEffect(() => {
    const pending = pendingCursor.current
    if (!pending) return
    pending.input.setSelectionRange(pending.cursor, pending.cursor)
    pendingCursor.current = null
  }, [cardNumber, expiry, cvc])

  function rememberCursor(
    input: HTMLInputElement,
    cursor: number,
    value: string,
    unchanged: boolean,
  ) {
    if (unchanged) {
      input.value = value
      input.setSelectionRange(cursor, cursor)
      return
    }

    pendingCursor.current = { input, cursor }
  }

  function markTouched(field: PaymentFieldName) {
    setTouched((current) => ({ ...current, [field]: true }))
  }

  function handleCardNumberChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const cursor = input.selectionStart ?? input.value.length
    const next = applyCardNumberEdit(cardNumber, input.value, cursor)
    rememberCursor(input, next.cursor, next.value, next.value === cardNumber)
    onCardNumberChange(next.value)
  }

  function handleExpiryChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const cursor = input.selectionStart ?? input.value.length
    const next = applyExpiryEdit(expiry, input.value, cursor)
    rememberCursor(input, next.cursor, next.value, next.value === expiry)
    onExpiryChange(next.value)
  }

  function handleCvcChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const cursor = input.selectionStart ?? input.value.length
    const next = applyCvcEdit(input.value, cursor)
    rememberCursor(input, next.cursor, next.value, next.value === cvc)
    onCvcChange(next.value)
  }

  const cardNumberError = touched.cardNumber ? getCardNumberError(cardNumber) : null
  const expiryError = touched.expiry ? getExpiryError(expiry) : null
  const cvcError = touched.cvc ? getCvcError(cvc) : null
  const canPay =
    getCardNumberError(cardNumber) === null &&
    getExpiryError(expiry) === null &&
    getCvcError(cvc) === null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextCardError = getCardNumberError(cardNumber)
    const nextExpiryError = getExpiryError(expiry)
    const nextCvcError = getCvcError(cvc)

    setTouched({ cardNumber: true, expiry: true, cvc: true })

    if (nextCardError) {
      cardNumberRef.current?.focus()
      return
    }

    if (nextExpiryError) {
      expiryRef.current?.focus()
      return
    }

    if (nextCvcError) {
      cvcRef.current?.focus()
      return
    }

    if (isProcessing) return

    onPay()
  }

  return (
    <form className="payment-form" noValidate onSubmit={handleSubmit} aria-busy={isProcessing}>
      {statusMessage ? (
        <p ref={statusRef} className="checkout-status" role="alert" tabIndex={-1}>
          {statusMessage}
        </p>
      ) : null}
      <PaymentField
        id={cardNumberId}
        label="Card number"
        value={cardNumber}
        error={cardNumberError}
        autoComplete="cc-number"
        placeholder="1234 5678 9012 3456"
        inputRef={cardNumberRef}
        disabled={isProcessing}
        onChange={handleCardNumberChange}
        onBlur={() => markTouched('cardNumber')}
      />
      <div className="payment-row">
        <PaymentField
          id={expiryId}
          label="Expiry"
          value={expiry}
          error={expiryError}
          autoComplete="cc-exp"
          placeholder="MM/YY"
          inputRef={expiryRef}
          disabled={isProcessing}
          onChange={handleExpiryChange}
          onBlur={() => markTouched('expiry')}
        />
        <PaymentField
          id={cvcId}
          label="CVC"
          value={cvc}
          error={cvcError}
          autoComplete="cc-csc"
          placeholder="123"
          inputRef={cvcRef}
          disabled={isProcessing}
          onChange={handleCvcChange}
          onBlur={() => markTouched('cvc')}
        />
      </div>
      <button className="checkout-primary" type="submit" disabled={!canPay || isProcessing}>
        {isProcessing
          ? 'Processing payment…'
          : statusMessage
            ? 'Try again'
            : `Pay ${formatProductPrice(product)}`}
      </button>
    </form>
  )
}
