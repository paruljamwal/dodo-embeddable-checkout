import {
  checkoutMessageSource,
  checkoutMessageTypes,
  closeReasons,
  errorCodes,
} from '../constants/checkout.ts'
import type {
  CheckoutClosed,
  CheckoutFailure,
  OpenCheckoutOptions,
  PaymentSuccess,
} from '../sdk/types.ts'

type CheckoutFrameEnvelope = {
  source: typeof checkoutMessageSource
}

export type OpenCheckoutMessage = CheckoutFrameEnvelope & {
  type: typeof checkoutMessageTypes.open
  payload: Pick<OpenCheckoutOptions, 'productId'>
}

export type CloseCheckoutMessage = CheckoutFrameEnvelope & {
  type: typeof checkoutMessageTypes.close
}

export type CheckoutReadyMessage = CheckoutFrameEnvelope & {
  type: typeof checkoutMessageTypes.ready
}

export type PaymentSucceededMessage = CheckoutFrameEnvelope & {
  type: typeof checkoutMessageTypes.paymentSucceeded
  payload: PaymentSuccess
}

export type PaymentFailedMessage = CheckoutFrameEnvelope & {
  type: typeof checkoutMessageTypes.paymentFailed
  payload: CheckoutFailure
}

export type CheckoutClosedMessage = CheckoutFrameEnvelope & {
  type: typeof checkoutMessageTypes.closed
  payload: CheckoutClosed
}

export type SdkToCheckoutMessage = OpenCheckoutMessage | CloseCheckoutMessage

export type CheckoutToSdkMessage =
  | CheckoutReadyMessage
  | PaymentSucceededMessage
  | PaymentFailedMessage
  | CheckoutClosedMessage

export type CheckoutFrameMessage = SdkToCheckoutMessage | CheckoutToSdkMessage

const errorCodeValues = new Set<string>(Object.values(errorCodes))
const closeReasonValues = new Set<string>(Object.values(closeReasons))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isPaymentSuccessPayload(value: unknown): value is PaymentSuccess {
  return isRecord(value) && isNonEmptyString(value.transactionId) && isNonEmptyString(value.productId)
}

function isCheckoutFailurePayload(value: unknown): value is CheckoutFailure {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    errorCodeValues.has(value.code) &&
    isNonEmptyString(value.message)
  )
}

function isCheckoutClosedPayload(value: unknown): value is CheckoutClosed {
  return isRecord(value) && typeof value.reason === 'string' && closeReasonValues.has(value.reason)
}

function hasCheckoutSource(value: Record<string, unknown>): boolean {
  return value.source === checkoutMessageSource
}

export function isOpenCheckoutMessage(value: unknown): value is OpenCheckoutMessage {
  if (!isRecord(value) || !hasCheckoutSource(value)) return false
  if (value.type !== checkoutMessageTypes.open || !isRecord(value.payload)) return false
  return isNonEmptyString(value.payload.productId)
}

export function isCheckoutToSdkMessage(value: unknown): value is CheckoutToSdkMessage {
  if (!isRecord(value) || !hasCheckoutSource(value)) return false

  if (value.type === checkoutMessageTypes.ready) return true

  if (value.type === checkoutMessageTypes.paymentSucceeded) {
    return isPaymentSuccessPayload(value.payload)
  }

  if (value.type === checkoutMessageTypes.paymentFailed) {
    return isCheckoutFailurePayload(value.payload)
  }

  if (value.type === checkoutMessageTypes.closed) {
    return isCheckoutClosedPayload(value.payload)
  }

  return false
}
