'use client'

import { useState } from 'react'
import { CheckCircle2, Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logPracticeToday } from '@/app/practice/actions'

export function PracticeStreak({
  initialStreak,
  initialDoneToday,
}: {
  initialStreak: number
  initialDoneToday: boolean
}) {
  const [status, setStatus] = useState<'idle' | 'done' | 'guest'>(
    initialDoneToday ? 'done' : 'idle'
  )
  // Logging today extends the streak by one; the server-rendered value takes
  // over again on the next load (logPracticeToday revalidates /practice).
  const [streak, setStreak] = useState(initialStreak)

  async function handleClick() {
    const result = await logPracticeToday()
    if (result.loggedIn) {
      setStatus('done')
      setStreak((current) => (initialDoneToday ? current : current + 1))
    } else {
      setStatus('guest')
    }
  }

  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Practice Streak</span>
      <p className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold">
        <Flame size={20} className={streak > 0 ? 'text-accent' : 'text-ink-muted'} />
        {streak} din
      </p>
      <p className="mt-1 font-bengali text-sm text-ink-muted">
        {streak > 0 ? 'Roj kotha bola chara upay nai.' : 'Aj theke shuru koro — roj ekbar.'}
      </p>
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
