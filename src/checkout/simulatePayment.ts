import {
  paymentDelayMs,
  simulateNetworkFailure,
  testCards,
} from '../constants/checkout.ts'

export type PaymentResult =
  | { status: 'success'; transactionId: string }
  | { status: 'declined' }
  | { status: 'failed'; cause: 'processor' | 'network' }

export type PaymentSimulation = {
  result: PaymentResult
  failedAttempts: number
}

type SimulatePaymentInput = {
  cardNumber: string
  failedAttempts: number
  networkFailure?: boolean
  delayMs?: number
}

function cardDigits(cardNumber: string): string {
  return cardNumber.replace(/\D/g, '')
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs)
  })
}

function createTransactionId(): string {
  return `txn_${crypto.randomUUID()}`
}

export async function simulatePayment(input: SimulatePaymentInput): Promise<PaymentSimulation> {
  const delayMs = input.delayMs ?? paymentDelayMs
  const networkFailure = input.networkFailure ?? simulateNetworkFailure

  await wait(delayMs)

  if (networkFailure) {
    return {
      result: { status: 'failed', cause: 'network' },
      failedAttempts: input.failedAttempts,
    }
  }

  const digits = cardDigits(input.cardNumber)

  if (digits === testCards.success) {
    return {
      result: { status: 'success', transactionId: createTransactionId() },
      failedAttempts: input.failedAttempts,
    }
  }

  if (digits === testCards.declined) {
    return {
      result: { status: 'declined' },
      failedAttempts: input.failedAttempts,
    }
  }

  if (digits === testCards.networkFailure) {
    return {
      result: { status: 'failed', cause: 'network' },
      failedAttempts: input.failedAttempts,
    }
  }

  if (digits === testCards.failsOnceThenSucceeds) {
    if (input.failedAttempts < 1) {
      return {
        result: { status: 'failed', cause: 'processor' },
        failedAttempts: input.failedAttempts + 1,
      }
    }

    return {
      result: { status: 'success', transactionId: createTransactionId() },
      failedAttempts: input.failedAttempts,
    }
  }

  return {
    result: { status: 'failed', cause: 'processor' },
    failedAttempts: input.failedAttempts,
  }
}
