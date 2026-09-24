import { useState } from 'react'
import { toast, Toaster } from 'sonner'
import { errorCodes } from '../constants/checkout.ts'
import { formatProductPrice, mockProduct } from '../checkout/product.ts'
import { DodoCheckout } from '../sdk/index.ts'
import type { CheckoutClosed, CheckoutFailure, PaymentSuccess } from '../sdk/types.ts'
import { EventLog } from './EventLog.tsx'
import { createMerchantLogEvent, type MerchantLogEvent } from './events.ts'
import 'sonner/dist/styles.css'
import './merchant.css'

export function MerchantPage() {
  const [events, setEvents] = useState<MerchantLogEvent[]>([])

  function record(event: MerchantLogEvent) {
    setEvents((current) => [...current, event])
  }

  function recordSuccess(result: PaymentSuccess) {
    const payload = {
      transactionId: result.transactionId,
      productId: result.productId,
    }
    toast.success('Payment successful', { description: payload.transactionId })
    record(createMerchantLogEvent('onSuccess', payload))
  }

  function recordClose(result: CheckoutClosed) {
    const payload = { reason: result.reason }
    toast('Checkout closed.')
    record(createMerchantLogEvent('onClose', payload))
  }

  function recordError(error: CheckoutFailure) {
    const payload = { code: error.code, message: error.message }
    toast.error(payload.message)
    record(createMerchantLogEvent('onError', payload))
  }

  function buy() {
    toast.dismiss()

    try {
      DodoCheckout.open({
        productId: mockProduct.id,
        onSuccess: recordSuccess,
        onClose: recordClose,
        onError: recordError,
      })
    } catch {
      recordError({
        code: errorCodes.checkoutLoadFailed,
        message: 'Checkout could not be opened.',
      })
    }
  }

  return (
    <main className="merchant">
      <Toaster position="bottom-center" closeButton duration={4500} />
      <div className="merchant-content">
        <article className="merchant-product">
          <h1>{mockProduct.name}</h1>
          <p className="merchant-description">{mockProduct.description}</p>
          <p className="merchant-price">
            {formatProductPrice(mockProduct)}
            <span className="merchant-currency">{mockProduct.currency}</span>
          </p>
          <button type="button" className="merchant-buy" onClick={buy}>
            Buy Now
          </button>
        </article>
        <EventLog
          events={events}
          onClear={() => {
            toast.dismiss()
            setEvents([])
          }}
        />
      </div>
    </main>
  )
}
