import type { Dictionary } from './i18n/dictionary'

export function safeRedirectPath(next: string, fallback = '/plan'): string {
  if (!next.startsWith('/')) return fallback
  if (next.startsWith('//') || next.startsWith('/\\')) return fallback
  return next
}

export function validateCredentials(
  t: Dictionary['validation'],
  email: string,
  password: string
): string | null {
  if (!email.trim()) return t.emailRequired
  if (!email.includes('@')) return t.emailInvalid
  if (password.length < 6) return t.passwordTooShort
  return null
}

export function validateName(t: Dictionary['validation'], name: string): string | null {
  if (!name.trim()) return t.nameRequired
  return null
}
