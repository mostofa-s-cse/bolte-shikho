'use client'

import { useMemo, useState } from 'react'
import { VOCAB } from '@/data/vocab'
import { filterVocab } from '@/lib/vocab-filter'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { CategoryChips } from './category-chips'
import { WordCard } from './word-card'
import { useTranslations } from '@/lib/i18n/locale-context'

export function VocabBrowser() {
  const { t, format } = useTranslations()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [quizMode, setQuizMode] = useState(false)
  const [rate, setRate] = useState(1)

  const filtered = useMemo(() => filterVocab(VOCAB, query, category), [query, category])
  const totalWords = useMemo(() => VOCAB.reduce((n, c) => n + c.words.length, 0), [])
  const shownWords = useMemo(() => filtered.reduce((n, c) => n + c.words.length, 0), [filtered])

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder={t.vocab.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <CategoryChips categories={VOCAB.map((c) => c.name)} active={category} onChange={setCategory} />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
        <span>
          {query || category !== 'All'
            ? format(t.vocab.wordCountFiltered, { shown: shownWords, total: totalWords })
            : format(t.vocab.wordCountAll, { total: totalWords })}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRate(1)}
            className={`cursor-pointer ${rate === 1 ? 'font-semibold text-accent' : ''}`}
          >
            {t.vocab.normalSpeed}
          </button>
          <button
            type="button"
            onClick={() => setRate(0.7)}
            className={`cursor-pointer ${rate === 0.7 ? 'font-semibold text-accent' : ''}`}
          >
            {t.vocab.slowSpeed}
          </button>
        </div>
        <label className="flex items-center gap-2">
          {t.vocab.quizMode}
          <Checkbox checked={quizMode} onChange={(e) => setQuizMode(e.target.checked)} />
        </label>
      </div>

      {filtered.map((cat) => (
        <section key={cat.name} className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-semibold">{cat.name}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {cat.words.map((word) => (
              <WordCard key={word.en} word={word} quizMode={quizMode} rate={rate} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
