import { describe, it, expect } from 'vitest'
import { normalizeSpeech } from '@/lib/speech'

describe('pronunciation match logic', () => {
  it('treats differently-cased/punctuated but equal text as a match', () => {
    expect(normalizeSpeech('Hello!')).toBe(normalizeSpeech('hello'))
  })
  it('treats different words as a non-match', () => {
    expect(normalizeSpeech('Hello')).not.toBe(normalizeSpeech('World'))
  })
})
