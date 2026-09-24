const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getEmailError(value: string): string | null {
  const email = value.trim()

  if (!email) {
    return 'Enter your email.'
  }

  if (!emailPattern.test(email)) {
    return 'Enter a valid email address.'
  }

  return null
}
