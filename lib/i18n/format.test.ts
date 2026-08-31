import { describe, it, expect } from 'vitest'
import { format } from './format'

describe('format', () => {
  it('returns the template unchanged with no vars', () => {
    expect(format('Notun Word')).toBe('Notun Word')
  })
  it('substitutes a single placeholder', () => {
    expect(format('{{total}} words', { total: 307 })).toBe('307 words')
  })
  it('substitutes multiple placeholders', () => {
    expect(format('{{shown}} / {{total}} words', { shown: 5, total: 307 })).toBe('5 / 307 words')
  })
  it('substitutes a string value', () => {
    expect(format('You said: "{{heard}}"', { heard: 'hello' })).toBe('You said: "hello"')
  })
})
