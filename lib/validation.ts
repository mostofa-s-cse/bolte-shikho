// Guards against an open redirect: post-login `next` comes from the query
// string, so only same-site relative paths are honoured. '//host' and '/\host'
// are protocol-relative URLs that browsers resolve off-site, so both are
// rejected along with anything that is not rooted at '/'.
export function safeRedirectPath(next: string, fallback = '/plan'): string {
  if (!next.startsWith('/')) return fallback
  if (next.startsWith('//') || next.startsWith('/\\')) return fallback
  return next
}

export function validateCredentials(email: string, password: string): string | null {
  if (!email.trim()) return 'Email dao.'
  if (!email.includes('@')) return 'Shothik email dao.'
  if (password.length < 6) return 'Password kompokkhe 6 character hote hobe.'
  return null
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Naam dao.'
  return null
}
