'use client'

import { useState } from 'react'
import { PLAN_TASKS } from '@/data/plan-tasks'
import type { DayStatus } from '@/lib/scoring'
import { PlanScoreCard } from './plan-score-card'
import { PlanCalendar } from './plan-calendar'
import { PlanTaskList } from './plan-task-list'

export function PlanClient({
  currentDay,
  statuses,
  score,
  doneOnTime,
  checkedByDay,
}: {
  currentDay: number
  statuses: DayStatus[]
  score: number
  doneOnTime: number
  checkedByDay: boolean[][]
}) {
  const [selected, setSelected] = useState(currentDay)

  return (
    <div className="mt-6 flex flex-col gap-6">
      <PlanScoreCard score={score} currentDay={currentDay} totalDays={PLAN_TASKS.length} doneOnTime={doneOnTime} />
      <PlanCalendar
        totalDays={PLAN_TASKS.length}
        statuses={statuses}
        today={currentDay}
        selected={selected}
        onSelect={setSelected}
      />
      <div>
        <h2 className="mb-2 font-semibold">Day {selected}</h2>
        <PlanTaskList day={selected} tasks={PLAN_TASKS[selected - 1]} checked={checkedByDay[selected - 1]} />
      </div>
    </div>
  )
}
