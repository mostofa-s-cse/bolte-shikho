import { describe, it, expect } from 'vitest'
import { VOCAB } from './vocab'

describe('VOCAB', () => {
  it('has 30 categories', () => {
    expect(VOCAB.length).toBe(30)
  })

  it('has 307 words in total', () => {
    const total = VOCAB.reduce((n, c) => n + c.words.length, 0)
    expect(total).toBe(307)
  })

  it('every category has a name and every word has all three fields', () => {
    for (const category of VOCAB) {
      expect(category.name.length).toBeGreaterThan(0)
      expect(category.words.length).toBeGreaterThan(0)
      for (const word of category.words) {
        expect(word.en.length).toBeGreaterThan(0)
        expect(word.pron.length).toBeGreaterThan(0)
        expect(word.mean.length).toBeGreaterThan(0)
      }
    }
  })

  it('contains the Pronoun category with "I"', () => {
    const pronouns = VOCAB.find((c) => c.name === 'Pronoun')
    expect(pronouns).toBeDefined()
    expect(pronouns!.words.some((w) => w.en === 'I')).toBe(true)
  })
})
