'use client'

import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { VocabWord } from '@/data/vocab'
import { speak } from '@/lib/speech'
import { cn } from '@/lib/utils'

export function WordCard({
  word,
  quizMode,
  rate,
}: {
  word: VocabWord
  quizMode: boolean
  rate: number
}) {
  const [revealed, setRevealed] = useState(false)
  const showMeaning = !quizMode || revealed

  return (
    <div
      className="grid cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 rounded-xl border border-border bg-surface p-4"
      onClick={() => setRevealed((r) => !r)}
    >
      <span className="font-semibold">{word.en}</span>
      <button
        type="button"
        aria-label="Listen"
        onClick={(e) => {
          e.stopPropagation()
          speak(word.en, rate)
        }}
        className="cursor-pointer rounded-md p-1 text-accent hover:bg-surface-alt"
      >
        <Volume2 size={16} />
      </button>
      {showMeaning ? (
        <span className="col-span-2 flex flex-wrap gap-2 font-bengali text-sm">
          <span className="text-accent">{word.pron}</span>
          <span className="text-ink-muted">— {word.mean}</span>
        </span>
      ) : (
        <span className={cn('col-span-2 font-bengali text-xs text-ink-muted opacity-70')}>
          দেখতে ট্যাপ করো
        </span>
      )}
    </div>
  )
}
