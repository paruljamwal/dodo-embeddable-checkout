import {
  checkoutMessageSource,
  checkoutMessageTypes,
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
