import { useEffect, useRef } from 'react'
import { ProductSummary } from './ProductSummary.tsx'
import type { Product } from '../product.ts'

type PaymentSuccessProps = {
  product: Product
  transactionId: string
}

export function PaymentSuccess({ product, transactionId }: PaymentSuccessProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <>
      <h1 ref={headingRef} className="checkout-step-heading" tabIndex={-1}>
        Payment complete
      </h1>
      <p className="checkout-lede">Your payment went through.</p>
      <dl className="checkout-transaction">
        <dt>Transaction ID</dt>
        <dd>{transactionId}</dd>
      </dl>
      <ProductSummary product={product} />
      <button type="button" className="checkout-primary checkout-done">
        Done
      </button>
    </>
  )
}
