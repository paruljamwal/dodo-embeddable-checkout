import type { CheckoutClosed, CheckoutFailure, PaymentSuccess } from '../sdk/types.ts'

export type MerchantLogEvent =
  | { id: string; type: 'onSuccess'; timestamp: number; payload: PaymentSuccess }
  | { id: string; type: 'onClose'; timestamp: number; payload: CheckoutClosed }
  | { id: string; type: 'onError'; timestamp: number; payload: CheckoutFailure }

export function createMerchantLogEvent(
  type: 'onSuccess',
  payload: PaymentSuccess,
): MerchantLogEvent
export function createMerchantLogEvent(
  type: 'onClose',
  payload: CheckoutClosed,
): MerchantLogEvent
export function createMerchantLogEvent(
  type: 'onError',
  payload: CheckoutFailure,
): MerchantLogEvent
export function createMerchantLogEvent(
  type: MerchantLogEvent['type'],
  payload: PaymentSuccess | CheckoutClosed | CheckoutFailure,
): MerchantLogEvent {
  const timestamp = Date.now()
  const id = crypto.randomUUID()

  if (type === 'onSuccess' && 'transactionId' in payload) {
    return {
      id,
      type,
      timestamp,
      payload: {
        transactionId: payload.transactionId,
        productId: payload.productId,
      },
    }
  }

  if (type === 'onClose' && 'reason' in payload) {
    return {
      id,
      type,
      timestamp,
      payload: { reason: payload.reason },
    }
  }

  if (type === 'onError' && 'code' in payload && 'message' in payload) {
    return {
      id,
      type,
      timestamp,
      payload: {
        code: payload.code,
        message: payload.message,
      },
    }
  }

  throw new Error('Unknown merchant log event')
}
