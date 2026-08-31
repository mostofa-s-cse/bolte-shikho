'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logPracticeToday } from '@/app/practice/actions'

export function PracticeStreak() {
  const [status, setStatus] = useState<'idle' | 'done' | 'guest'>('idle')

  async function handleClick() {
    const result = await logPracticeToday()
    setStatus(result.loggedIn ? 'done' : 'guest')
  }

  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Practice Streak</span>
      <p className="mt-2 font-bengali text-sm text-ink-muted">Roj kotha bola chara upay nai.</p>
      <Button className="mt-4" onClick={handleClick} disabled={status === 'done'}>
        {status === 'done' && <CheckCircle2 size={16} />}
        {status === 'done' ? 'Ajke practice hoye geche' : 'Ajke Practice Korlam'}
      </Button>
      {status === 'guest' && (
        <p className="mt-2 font-bengali text-sm text-bad">Streak save korte hole login koro.</p>
      )}
    </Card>
  )
}
