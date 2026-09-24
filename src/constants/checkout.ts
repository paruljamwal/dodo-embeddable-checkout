export const closeReasons = {
  userClosed: 'user_closed',
  paymentCompleted: 'payment_completed',
  checkoutError: 'checkout_error',
} as const

export type CloseReason = (typeof closeReasons)[keyof typeof closeReasons]

export const errorCodes = {
  checkoutLoadFailed: 'checkout_load_failed',
  paymentDeclined: 'payment_declined',
  paymentFailed: 'payment_failed',
  communicationFailed: 'communication_failed',
  invalidConfiguration: 'invalid_configuration',
} as const

export type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes]

export const checkoutFramePath = '/checkout'

export function getCheckoutFrameUrl(): string {
  return new URL(checkoutFramePath, window.location.origin).href
}

export function getCheckoutOrigin(): string {
  return new URL(getCheckoutFrameUrl()).origin
}

export const checkoutMessageSource = 'dodo-checkout'

export const checkoutMessageTypes = {
  open: 'checkout.open',
  close: 'checkout.close',
  ready: 'checkout.ready',
  paymentSucceeded: 'checkout.payment_succeeded',
  paymentFailed: 'checkout.payment_failed',
  closed: 'checkout.closed',
} as const

export const simulateNetworkFailure = false

export const paymentDelayMs = 1000

export const checkoutLoadTimeoutMs = 8000

export const testCards = {
  success: '4242424242424242',
  declined: '4000000000000002',
  failsOnceThenSucceeds: '4000000000000341',
  networkFailure: '4000000000000119',
} as const
