import { describe, it, expect } from 'vitest'
import { validateCredentials } from './validation'

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
