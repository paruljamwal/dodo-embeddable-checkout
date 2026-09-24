const cardNumberLength = 16
const expiryLength = 4
const cvcLength = 3

export function cursorAfterDigitCount(value: string, digitCount: number): number {
  if (digitCount <= 0) return 0

  let seen = 0

  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index] ?? '')) {
      seen += 1
      if (seen === digitCount) return index + 1
    }
  }

  return value.length
}

function digitsOnly(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

function groupCardNumber(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function groupExpiry(digits: string): string {
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function applyFormattedEdit(
  previous: string,
  next: string,
  cursor: number,
  maxDigits: number,
  format: (digits: string) => string,
): { value: string; cursor: number } {
  const removedOne = previous.length === next.length + 1
  const removedSeparator = removedOne && /[\s/]/.test(previous[cursor] ?? '')

  if (removedSeparator) {
    const digits = previous.replace(/\D/g, '')
    const digitsBefore = previous.slice(0, cursor).replace(/\D/g, '').length
    const nextDigits =
      digits.slice(0, Math.max(0, digitsBefore - 1)) + digits.slice(digitsBefore)
    const value = format(nextDigits)
    return {
      value,
      cursor: cursorAfterDigitCount(value, Math.max(0, digitsBefore - 1)),
    }
  }

  const digits = digitsOnly(next, maxDigits)
  const value = format(digits)
  const digitsBefore = Math.min(
    next.slice(0, cursor).replace(/\D/g, '').length,
    digits.length,
  )

  return { value, cursor: cursorAfterDigitCount(value, digitsBefore) }
}

export function applyCardNumberEdit(
  previous: string,
  next: string,
  cursor: number,
): { value: string; cursor: number } {
  return applyFormattedEdit(previous, next, cursor, cardNumberLength, groupCardNumber)
}

export function applyExpiryEdit(
  previous: string,
  next: string,
  cursor: number,
): { value: string; cursor: number } {
  return applyFormattedEdit(previous, next, cursor, expiryLength, groupExpiry)
}

export function applyCvcEdit(next: string, cursor: number): { value: string; cursor: number } {
  const digitsBefore = next.slice(0, cursor).replace(/\D/g, '').length
  const value = digitsOnly(next, cvcLength)

  return { value, cursor: Math.min(digitsBefore, value.length) }
}

function passesLuhn(digits: string): boolean {
  let sum = 0
  let doubleDigit = false

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])

    if (doubleDigit) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    doubleDigit = !doubleDigit
  }

  return sum % 10 === 0
}

export function getCardNumberError(value: string): string | null {
  const digits = value.replace(/\D/g, '')

  if (!digits) return 'Enter a card number.'

  if (digits.length !== cardNumberLength || !passesLuhn(digits)) {
    return 'Enter a valid card number.'
  }

  return null
}

export function getExpiryError(value: string, today = new Date()): string | null {
  if (!value) return 'Enter an expiry date.'

  const match = /^(\d{2})\/(\d{2})$/.exec(value)

  if (!match) return 'Enter a valid expiry date.'

  const month = Number(match[1])
  const year = 2000 + Number(match[2])

  if (month < 1 || month > 12) return 'Enter a valid expiry date.'

  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'This card has expired.'
  }

  return null
}

export function getCvcError(value: string): string | null {
  if (!value) return 'Enter the CVC.'
  if (!/^\d{3}$/.test(value)) return 'Enter a valid CVC.'
  return null
}
