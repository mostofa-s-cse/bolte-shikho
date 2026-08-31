'use client'

import { useOptimistic, useTransition } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { toggleTask } from '@/app/[lang]/plan/actions'

export function PlanTaskList({
  day,
  tasks,
  checked,
}: {
  day: number
  tasks: string[]
  checked: boolean[]
}) {
  const [, startTransition] = useTransition()
  // `checked` only changes after the Server Action round-trip plus the
  // revalidate, so without this the box appears not to respond (or snaps
  // back) while the request is in flight. React drops the optimistic value
  // once the transition settles and the re-rendered Server Component sends
  // the confirmed one down.
  const [optimisticChecked, applyOptimistic] = useOptimistic(
    checked,
    (current, action: { index: number; value: boolean }) =>
      current.map((isChecked, i) => (i === action.index ? action.value : isChecked))
  )

  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
      {tasks.map((task, i) => (
        <label key={i} className="flex items-start gap-3 p-3">
          <Checkbox
            checked={optimisticChecked[i] ?? false}
            onChange={(e) => {
              const isChecked = e.target.checked
              startTransition(async () => {
                applyOptimistic({ index: i, value: isChecked })
                await toggleTask(day, i, isChecked, tasks.length)
              })
            }}
          />
          <span
            className={
              optimisticChecked[i] ? 'font-bengali text-ink-muted line-through' : 'font-bengali'
            }
          >
            {task}
          </span>
        </label>
      ))}
    </div>
  )
}
