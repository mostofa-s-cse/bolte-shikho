'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PromptCard({ prompts }: { prompts: string[] }) {
  // Starts deterministically at the first prompt: Math.random() in the
  // initializer produced a different value on the server than at hydration,
  // which mismatched and made the visible prompt swap right after load.
  // "Notun Prompt" is how you get a different one.
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
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Ajker Topic</span>
      <p data-testid="prompt-text" className="mt-2 font-bengali text-lg">
        {prompts[index]}
      </p>
      <Button className="mt-4" onClick={next}>
        Notun Prompt
      </Button>
    </Card>
  )
}
