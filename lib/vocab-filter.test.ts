import { describe, it, expect } from 'vitest'
import { filterVocab } from './vocab-filter'
import type { VocabCategory } from '@/data/vocab'

const SAMPLE: VocabCategory[] = [
  { name: 'Pronoun', words: [{ en: 'I', pron: 'আই', mean: 'আমি' }] },
  { name: 'Color', words: [{ en: 'Red', pron: 'রেড', mean: 'লাল' }, { en: 'Blue', pron: 'ব্লু', mean: 'নীল' }] },
]

describe('filterVocab', () => {
  it('returns everything when query is empty and category is "All"', () => {
    expect(filterVocab(SAMPLE, '', 'All')).toEqual(SAMPLE)
  })

  it('filters to a single category', () => {
    const result = filterVocab(SAMPLE, '', 'Color')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Color')
  })

  it('matches by English word, pronunciation, or meaning, case-insensitively', () => {
    expect(filterVocab(SAMPLE, 'red', 'All')[0].words).toEqual([{ en: 'Red', pron: 'রেড', mean: 'লাল' }])
    expect(filterVocab(SAMPLE, 'লাল', 'All')[0].words).toEqual([{ en: 'Red', pron: 'রেড', mean: 'লাল' }])
  })

  it('drops categories with no matches', () => {
    expect(filterVocab(SAMPLE, 'zzz', 'All')).toEqual([])
  })
})
