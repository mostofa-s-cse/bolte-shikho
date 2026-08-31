import { describe, it, expect } from 'vitest'
import { validateCredentials, validateName, safeRedirectPath } from './validation'
import { DICTIONARIES } from './i18n/dictionary'

const t = DICTIONARIES.bn.validation

describe('safeRedirectPath', () => {
  // unchanged from existing file
  it('keeps a same-site relative path', () => {
    expect(safeRedirectPath('/plan')).toBe('/plan')
    expect(safeRedirectPath('/vocab?tab=1')).toBe('/vocab?tab=1')
  })
  it('rejects an absolute off-site URL', () => {
    expect(safeRedirectPath('https://evil.com')).toBe('/plan')
  })
  it('rejects a protocol-relative URL', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/plan')
    expect(safeRedirectPath('/\\evil.com')).toBe('/plan')
  })
  it('rejects a bare path with no leading slash', () => {
    expect(safeRedirectPath('evil.com')).toBe('/plan')
    expect(safeRedirectPath('')).toBe('/plan')
  })
  it('uses the given fallback', () => {
    expect(safeRedirectPath('https://evil.com', '/')).toBe('/')
  })
})

describe('validateCredentials', () => {
  it('rejects an empty email', () => {
    expect(validateCredentials(t, '', 'password123')).toBe(t.emailRequired)
  })
  it('rejects an email without @', () => {
    expect(validateCredentials(t, 'not-an-email', 'password123')).toBe(t.emailInvalid)
  })
  it('rejects a password shorter than 6 characters', () => {
    expect(validateCredentials(t, 'a@b.com', '123')).toBe(t.passwordTooShort)
  })
  it('returns null for valid credentials', () => {
    expect(validateCredentials(t, 'a@b.com', 'password123')).toBeNull()
  })
})

describe('validateName', () => {
  it('rejects an empty name', () => {
    expect(validateName(t, '')).toBe(t.nameRequired)
  })
  it('rejects a whitespace-only name', () => {
    expect(validateName(t, '   ')).toBe(t.nameRequired)
  })
  it('returns null for a valid name', () => {
    expect(validateName(t, 'Mostofa')).toBeNull()
  })
})
