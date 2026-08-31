'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/i18n/locale-context'

export function PromptCard({ prompts }: { prompts: string[] }) {
  const { t } = useTranslations()
  // Starts deterministically at the first prompt: Math.random() in the
  // initializer produced a different value on the server than at hydration,
  // which mismatched and made the visible prompt swap right after load.
  const [index, setIndex] = useState(0)

  function next() {
    setIndex((current) => {
      if (prompts.length <= 1) return current
      let n = current
      while (n === current) n = Math.floor(Math.random() * prompts.length)
      return n
    })
  }

  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {t.practice.prompt.label}
      </span>
      <p data-testid="prompt-text" className="mt-2 font-bengali text-lg">
        {prompts[index]}
      </p>
      <Button className="mt-4" onClick={next}>
        {t.practice.prompt.next}
      </Button>
    </Card>
  )
}
