import { describe, it, expect } from 'vitest'
import { validateCredentials, validateName, safeRedirectPath } from './validation'

describe('safeRedirectPath', () => {
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
    expect(validateCredentials('', 'password123')).toBe('Email dao.')
  })
  it('rejects an email without @', () => {
    expect(validateCredentials('not-an-email', 'password123')).toBe('Shothik email dao.')
  })
  it('rejects a password shorter than 6 characters', () => {
    expect(validateCredentials('a@b.com', '123')).toBe('Password kompokkhe 6 character hote hobe.')
  })
  it('returns null for valid credentials', () => {
    expect(validateCredentials('a@b.com', 'password123')).toBeNull()
  })
})

describe('validateName', () => {
  it('rejects an empty name', () => {
    expect(validateName('')).toBe('Naam dao.')
  })
  it('rejects a whitespace-only name', () => {
    expect(validateName('   ')).toBe('Naam dao.')
  })
  it('returns null for a valid name', () => {
    expect(validateName('Mostofa')).toBeNull()
  })
})
