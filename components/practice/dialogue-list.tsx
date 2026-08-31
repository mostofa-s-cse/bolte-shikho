'use client'

import { Volume2 } from 'lucide-react'
import type { Dialogue } from '@/data/dialogues'
import { speak } from '@/lib/speech'

export function DialogueList({ dialogues }: { dialogues: Dialogue[] }) {
  return (
    <div className="flex flex-col gap-8">
      {dialogues.map((dialogue) => (
        <div key={dialogue.title}>
          <h3 className="font-semibold">{dialogue.title}</h3>
          <div className="mt-2 flex flex-col divide-y divide-border rounded-xl border border-border">
            {dialogue.lines.map((line, i) => (
              <div key={i} className="flex flex-col gap-1 p-3">
                <span className="flex items-center gap-2 font-semibold">
                  {line.speaker && <span className="text-accent">{line.speaker}:</span>} {line.en}
                  <button
                    type="button"
                    aria-label="Listen"
                    onClick={() => speak(line.en)}
                    className="cursor-pointer rounded-md p-1 text-accent hover:bg-surface-alt"
                  >
                    <Volume2 size={14} />
                  </button>
                </span>
                <span className="font-bengali text-sm text-accent">{line.pron}</span>
                <span className="font-bengali text-sm text-ink-muted">{line.mean}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
