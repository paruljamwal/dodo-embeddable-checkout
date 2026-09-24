import { CheckoutHeader } from '../components/CheckoutHeader.tsx'
import { CheckoutLayout } from '../components/CheckoutLayout.tsx'
import { ProductSummary } from '../components/ProductSummary.tsx'
import { mockProduct } from '../product.ts'
import '../checkout.css'

export function CheckoutPage() {
  return (
    <CheckoutLayout>
      <CheckoutHeader />
      <main className="checkout-main">
        <h1>Complete your purchase</h1>
        <p className="checkout-lede">
          You'll pay on this page. The store never receives your card.
        </p>
        <ProductSummary product={mockProduct} />
        <p className="checkout-trust">Card details stay in this checkout.</p>
      </main>
    </CheckoutLayout>
  )
}
