import { useEffect, useRef } from 'react'
import { ProductSummary } from './ProductSummary.tsx'
import type { Product } from '../product.ts'

type PaymentSuccessProps = {
  product: Product
  transactionId: string
  onDone: () => void
}

export function PaymentSuccess({ product, transactionId, onDone }: PaymentSuccessProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <>
      <h1 ref={headingRef} className="checkout-step-heading" tabIndex={-1}>
        Payment successful
      </h1>
      <p className="checkout-lede">Your payment has been completed.</p>
      <dl className="checkout-transaction">
        <dt>Transaction ID</dt>
        <dd>{transactionId}</dd>
      </dl>
      <ProductSummary product={product} />
      <button type="button" className="checkout-primary checkout-done" onClick={onDone}>
        Done
      </button>
    </>
  )
}
