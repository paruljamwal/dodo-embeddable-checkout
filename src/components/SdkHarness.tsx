import { mockProduct } from '../checkout/product.ts'
import { DodoCheckout } from '../sdk/index.ts'
import './sdk-harness.css'

const noop = () => {}

export function SdkHarness() {
  return (
    <main className="sdk-harness">
      <h1>Store</h1>
      <p>This page stays in place while checkout is open.</p>
      <button
        type="button"
        className="sdk-harness-open"
        onClick={() => {
          DodoCheckout.open({
            productId: mockProduct.id,
            onSuccess: noop,
            onClose: noop,
            onError: noop,
          })
        }}
      >
        Open checkout
      </button>
    </main>
  )
}
