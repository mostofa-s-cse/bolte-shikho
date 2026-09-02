'use client'

import { useState } from 'react'
import { PLAN_TASKS } from '@/data/plan-tasks'
import type { DayStatus } from '@/lib/scoring'
import { PlanScoreCard } from './plan-score-card'
import { PlanCalendar } from './plan-calendar'
import { PlanTaskList } from './plan-task-list'
import { useTranslations } from '@/lib/i18n/locale-context'

export function PlanClient({
  currentDay,
  statuses,
  score,
  doneOnTime,
  checkedByDay,
  startDate,
}: {
  currentDay: number
  statuses: DayStatus[]
  score: number
  doneOnTime: number
  checkedByDay: boolean[][]
  startDate: string
}) {
  const { t, format, locale } = useTranslations()
  const [selected, setSelected] = useState(currentDay)

  const startedOn = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${startDate}T00:00:00Z`))

  return (
    <div className="mt-6 flex flex-col gap-6">
      <PlanScoreCard score={score} currentDay={currentDay} totalDays={PLAN_TASKS.length} doneOnTime={doneOnTime} />
      <p className="text-sm text-ink-muted">{format(t.plan.startedOn, { date: startedOn })}</p>
      <PlanCalendar
        totalDays={PLAN_TASKS.length}
        statuses={statuses}
        today={currentDay}
        selected={selected}
        onSelect={setSelected}
        startDate={startDate}
      />
      <div>
        <h2 className="mb-2 font-semibold">{format(t.plan.day, { day: selected })}</h2>
        <PlanTaskList day={selected} tasks={PLAN_TASKS[selected - 1]} checked={checkedByDay[selected - 1]} />
      </div>
    </div>
  )
}
