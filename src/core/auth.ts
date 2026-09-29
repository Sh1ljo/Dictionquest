/**
 * Simulated email sign-in. Nothing is sent and nothing is secure: the "account" is a
 * record in this browser's localStorage, keyed by email, and the code is shown on screen.
 * When real auth is added, replace makeCode/verification with the provider's magic-link
 * or one-time-code flow; the rest of the app only needs the signed-in email.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

export function isValidEmail(raw: string): boolean {
  const email = normalizeEmail(raw)
  return email.length <= 254 && EMAIL.test(email)
}

/** Six digits, as a real emailed code would be. */
export function makeCode(): string {
  return String(100000 + Math.floor(Math.random() * 900000))
}
