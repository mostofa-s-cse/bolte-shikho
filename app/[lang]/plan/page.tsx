import { PLAN_TASKS } from '@/data/plan-tasks'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  dateFromStartOffset,
  getCurrentPlanDay,
  computeDayStatus,
  computeScore,
  todayISO,
} from '@/lib/scoring'
import { PlanStartCard } from '@/components/plan/plan-start-card'
import { PlanClient } from '@/components/plan/plan-client'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function PlanPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const t = await getDictionary()

  const today = todayISO()

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">{t.plan.headingGuest}</h1>
        <p className="mt-4 font-bengali text-ink-muted">{t.plan.loginPrompt}</p>
      </main>
    )
  }

  const { data: startRow } = await supabase
    .from('plan_start')
    .select('start_date')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!startRow) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">{t.plan.headingGuest}</h1>
        <div className="mt-6">
          <PlanStartCard today={today} />
        </div>
      </main>
    )
  }

  const [{ data: progressRows }, { data: completionRows }] = await Promise.all([
    supabase.from('plan_task_progress').select('plan_day, task_index, completed_at').eq('user_id', user.id),
    supabase.from('plan_day_completion').select('plan_day, completed_date').eq('user_id', user.id),
  ])

  const checkedByDay: boolean[][] = PLAN_TASKS.map((tasks) => tasks.map(() => false))
  for (const row of progressRows ?? []) {
    if (row.completed_at) checkedByDay[row.plan_day - 1][row.task_index] = true
  }
  const completedDateByDay = new Map((completionRows ?? []).map((r) => [r.plan_day, r.completed_date]))

  const currentDay = getCurrentPlanDay(startRow.start_date, PLAN_TASKS.length, today)

  const statuses = PLAN_TASKS.map((tasks, idx) => {
    const dayNumber = idx + 1
    const checkedCount = checkedByDay[idx].filter(Boolean).length
    return computeDayStatus({
      startDate: startRow.start_date,
      dayNumber,
      taskCount: tasks.length,
      checkedCount,
      completedDate: completedDateByDay.get(dayNumber) ?? null,
      today,
    })
  })

  const { score, doneOnTime } = computeScore(
    PLAN_TASKS.map((tasks, idx) => ({
      taskCount: tasks.length,
      checkedCount: checkedByDay[idx].filter(Boolean).length,
      scheduledDate: dateFromStartOffset(startRow.start_date, idx),
      completedDate: completedDateByDay.get(idx + 1) ?? null,
    }))
  )

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">{t.plan.headingScore}</h1>
      <PlanClient
        currentDay={currentDay}
        statuses={statuses}
        score={score}
        doneOnTime={doneOnTime}
        checkedByDay={checkedByDay}
      />
    </main>
  )
}
