import { Card } from '@/components/ui/card'

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
  const stats = [
    { label: 'Score', value: score },
    { label: 'Aj Day / Total', value: `${currentDay}/${totalDays}` },
    { label: 'Din Sesh (on time)', value: doneOnTime },
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
