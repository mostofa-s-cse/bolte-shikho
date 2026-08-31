import { describe, it, expect } from 'vitest'
import { DICTIONARIES } from './dictionary'

describe('DICTIONARIES', () => {
  it('has both locales with the same top-level keys', () => {
    expect(Object.keys(DICTIONARIES)).toEqual(['bn', 'en'])
    expect(Object.keys(DICTIONARIES.bn).sort()).toEqual(Object.keys(DICTIONARIES.en).sort())
  })
  it('has real Bangla script for bn, not Banglish', () => {
    expect(DICTIONARIES.bn.nav.vocab).toBe('শব্দ')
    expect(DICTIONARIES.en.nav.vocab).toBe('Vocab')
  })
})
