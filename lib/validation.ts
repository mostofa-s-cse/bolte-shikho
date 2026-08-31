export function validateCredentials(email: string, password: string): string | null {
  if (!email.trim()) return 'Email dao.'
  if (!email.includes('@')) return 'Shothik email dao.'
  if (password.length < 6) return 'Password kompokkhe 6 character hote hobe.'
  return null
}
