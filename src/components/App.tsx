import { checkoutFramePath } from '../constants/checkout.ts'
import { CheckoutPage } from '../checkout/pages/CheckoutPage.tsx'
import { SdkHarness } from './SdkHarness.tsx'

function App() {
  if (window.location.pathname === checkoutFramePath) {
    return <CheckoutPage />
  }

  return <SdkHarness />
}

export default App
