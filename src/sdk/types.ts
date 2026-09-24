import type { CloseReason, ErrorCode } from '../constants/checkout.ts'

export type PaymentSuccess = {
  transactionId: string
  productId: string
}

export type CheckoutClosed = {
  reason: CloseReason
}

export type CheckoutFailure = {
  code: ErrorCode
  message: string
}

export type OpenCheckoutOptions = {
  productId: string
  onSuccess: (result: PaymentSuccess) => void
  onClose: (result: CheckoutClosed) => void
  onError: (error: CheckoutFailure) => void
}
