import { checkoutFramePath } from '../constants/checkout.ts'
import { CheckoutPage } from '../checkout/pages/CheckoutPage.tsx'
import { MerchantPage } from '../merchant/MerchantPage.tsx'

function App() {
  if (window.location.pathname === checkoutFramePath) {
    return <CheckoutPage />
  }

  return <MerchantPage />
}

export default App
