import { useState } from 'react'
import { errorCodes } from '../constants/checkout.ts'
import { formatProductPrice, mockProduct } from '../checkout/product.ts'
import { DodoCheckout } from '../sdk/index.ts'
import type { CheckoutClosed, CheckoutFailure, PaymentSuccess } from '../sdk/types.ts'
import { EventLog } from './EventLog.tsx'
import { createMerchantLogEvent, type MerchantLogEvent } from './events.ts'
import './merchant.css'

type MerchantNotice =
  | { status: 'success'; result: PaymentSuccess }
  | { status: 'closed'; result: CheckoutClosed }
  | { status: 'error'; error: CheckoutFailure }

export function MerchantPage() {
  const [notice, setNotice] = useState<MerchantNotice | null>(null)
  const [events, setEvents] = useState<MerchantLogEvent[]>([])

  function record(event: MerchantLogEvent) {
    setEvents((current) => [...current, event])
  }

  function recordSuccess(result: PaymentSuccess) {
    const payload = {
      transactionId: result.transactionId,
      productId: result.productId,
    }
    setNotice({ status: 'success', result: payload })
    record(createMerchantLogEvent('onSuccess', payload))
  }

  function recordClose(result: CheckoutClosed) {
    const payload = { reason: result.reason }
    setNotice({ status: 'closed', result: payload })
    record(createMerchantLogEvent('onClose', payload))
  }

  function recordError(error: CheckoutFailure) {
    const payload = { code: error.code, message: error.message }
    setNotice({ status: 'error', error: payload })
    record(createMerchantLogEvent('onError', payload))
  }

  function buy() {
    setNotice(null)

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
      <p className="merchant-brand">Field Goods</p>
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
        {notice?.status === 'success' ? (
          <div className="merchant-status" role="status">
            <p className="merchant-status-title">Payment successful</p>
            <p className="merchant-transaction">
              <span>Transaction ID</span>
              <strong>{notice.result.transactionId}</strong>
            </p>
          </div>
        ) : null}
        {notice?.status === 'closed' ? (
          <p className="merchant-status" role="status">
            Checkout closed.
          </p>
        ) : null}
        {notice?.status === 'error' ? (
          <p className="merchant-status merchant-status-error" role="alert">
            {notice.error.message}
          </p>
        ) : null}
      </article>
      <EventLog events={events} onClear={() => setEvents([])} />
    </main>
  )
}
