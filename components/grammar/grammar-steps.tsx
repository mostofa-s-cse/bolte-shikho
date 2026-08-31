'use client'

import { Volume2 } from 'lucide-react'
import type { GrammarStep } from '@/data/grammar'
import { speak } from '@/lib/speech'

export function GrammarSteps({ steps }: { steps: GrammarStep[] }) {
  return (
    <div className="flex flex-col gap-10">
      {steps.map((step) => (
        <section key={step.title} className="flex flex-col gap-3 border-b border-border pb-8">
          <div className="flex items-baseline gap-3 border-b border-border pb-1.5">
            {step.number && <span className="font-display text-xl font-bold text-accent">{step.number}</span>}
            <h2 className="font-display text-lg font-bold">{step.title}</h2>
          </div>
          {step.intro && <p className="font-bengali text-sm text-ink-muted">{step.intro}</p>}

          {step.blocks.map((block, bi) => (
            <div key={bi} className="flex flex-col gap-2">
              {block.structure && (
                <div className="rounded-lg border border-border bg-surface p-3 font-semibold">
                  {block.structure}
                </div>
              )}
              {block.tag && <p className="font-bengali text-sm text-ink-muted">{block.tag}</p>}
              {block.examples.length > 0 && (
                <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
                  {block.examples.map((example, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3">
                      <span className="flex items-center gap-2 font-semibold">
                        {example.en}
                        <button
                          type="button"
                          aria-label="Listen"
                          onClick={() => speak(example.en)}
                          className="rounded-md p-1 text-accent hover:bg-surface-alt"
                        >
                          <Volume2 size={14} />
                        </button>
                      </span>
                      <span className="font-bengali text-sm text-accent">{example.pron}</span>
                      <span className="font-bengali text-sm text-ink-muted">{example.mean}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {step.table && (
            <table className="w-full border-collapse overflow-hidden rounded-xl border border-border text-sm">
              <thead>
                <tr>
                  {step.table.headers.map((header) => (
                    <th key={header} className="border-b border-border bg-surface-alt p-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {step.table.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border-b border-border p-2 last:border-b-0">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {step.note && <p className="font-bengali text-sm text-ink-muted">{step.note}</p>}
        </section>
      ))}
    </div>
  )
}
