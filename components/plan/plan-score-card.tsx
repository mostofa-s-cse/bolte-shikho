'use client'

import { Card } from '@/components/ui/card'
import { useTranslations } from '@/lib/i18n/locale-context'

export function PlanScoreCard({
  score,
  currentDay,
  totalDays,
  doneOnTime,
}: {
  score: number
  currentDay: number
  totalDays: number
  doneOnTime: number
}) {
  const { t } = useTranslations()
  const stats = [
    { label: t.plan.score, value: score },
    { label: t.plan.dayOfTotal, value: `${currentDay}/${totalDays}` },
    { label: t.plan.onTime, value: doneOnTime },
  ]
  return (
    <Card>
      <div className="flex flex-wrap gap-6">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="font-display text-2xl font-bold tabular-nums">{stat.value}</div>
            <div className="text-xs uppercase tracking-wide text-ink-muted">{stat.label}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
