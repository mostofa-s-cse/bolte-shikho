'use client'

import { useState } from 'react'
import { CheckCircle2, Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logPracticeToday } from '@/app/[lang]/practice/actions'
import { useTranslations } from '@/lib/i18n/locale-context'

export function PracticeStreak({
  initialStreak,
  initialDoneToday,
}: {
  initialStreak: number
  initialDoneToday: boolean
}) {
  const { t, format } = useTranslations()
  const [status, setStatus] = useState<'idle' | 'done' | 'guest'>(
    initialDoneToday ? 'done' : 'idle'
  )
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
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {t.practice.streak.label}
      </span>
      <p className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold">
        <Flame size={20} className={streak > 0 ? 'text-accent' : 'text-ink-muted'} />
        {format(t.practice.streak.days, { n: streak })}
      </p>
      <p className="mt-1 font-bengali text-sm text-ink-muted">
        {streak > 0 ? t.practice.streak.encourageActive : t.practice.streak.encourageStart}
      </p>
      <Button className="mt-4" onClick={handleClick} disabled={status === 'done'}>
        {status === 'done' && <CheckCircle2 size={16} />}
        {status === 'done' ? t.practice.streak.doneButton : t.practice.streak.actionButton}
      </Button>
      {status === 'guest' && (
        <p className="mt-2 font-bengali text-sm text-bad">{t.practice.streak.guestNotice}</p>
      )}
    </Card>
  )
}
