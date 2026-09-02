import { describe, it, expect, afterEach } from 'vitest'
import { isRateLimited, resetRateLimit } from './rate-limit'

afterEach(() => resetRateLimit())

describe('isRateLimited', () => {
  it('allows requests under the limit', () => {
    for (let i = 0; i < 20; i++) {
      expect(isRateLimited('client-a')).toBe(false)
    }
  })

  it('blocks once a client exceeds the limit', () => {
    for (let i = 0; i < 20; i++) isRateLimited('client-b')
    expect(isRateLimited('client-b')).toBe(true)
  })

  it('tracks separate clients independently', () => {
    for (let i = 0; i < 20; i++) isRateLimited('client-c')
    expect(isRateLimited('client-d')).toBe(false)
  })
})
