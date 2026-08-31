import { describe, it, expect } from 'vitest'
import { GRAMMAR_STEPS } from './grammar'

describe('GRAMMAR_STEPS', () => {
  it('has 15 steps', () => {
    expect(GRAMMAR_STEPS.length).toBe(15)
  })

  it('every step has a title and either at least one example or a table', () => {
    for (const step of GRAMMAR_STEPS) {
      expect(step.title.length).toBeGreaterThan(0)
      const exampleCount = step.blocks.reduce((n, b) => n + b.examples.length, 0)
      expect(exampleCount > 0 || !!step.table).toBe(true)
    }
  })

  it('step 1 is Present Simple', () => {
    expect(GRAMMAR_STEPS[0].title).toBe('Present Simple')
  })

  it('Modal Verb has 5 blocks (the shared structure note plus 4 modals)', () => {
    const modal = GRAMMAR_STEPS.find((s) => s.title === 'Modal Verb')
    expect(modal?.blocks.length).toBe(5)
  })

  it('Irregular Verb has a 12-row table and no examples', () => {
    const irregular = GRAMMAR_STEPS.find((s) => s.title === 'Irregular Verb')
    expect(irregular?.table?.rows.length).toBe(12)
    expect(irregular?.blocks.reduce((n, b) => n + b.examples.length, 0)).toBe(0)
  })
})
