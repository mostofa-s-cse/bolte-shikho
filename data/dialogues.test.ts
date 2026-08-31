import { describe, it, expect } from 'vitest'
import { DIALOGUES } from './dialogues'
import { PROMPTS } from './prompts'

describe('DIALOGUES', () => {
  it('has 5 dialogues', () => {
    expect(DIALOGUES.length).toBe(5)
  })
  it('every dialogue has at least 2 lines', () => {
    for (const dialogue of DIALOGUES) {
      expect(dialogue.lines.length).toBeGreaterThanOrEqual(2)
    }
  })
  it('the Self Introduction dialogue has no speaker labels', () => {
    const intro = DIALOGUES.find((d) => d.title.includes('Self Introduction'))
    expect(intro).toBeDefined()
    expect(intro!.lines.every((l) => l.speaker === null)).toBe(true)
  })
})

describe('PROMPTS', () => {
  it('has 16 prompts', () => {
    expect(PROMPTS.length).toBe(16)
  })
})
