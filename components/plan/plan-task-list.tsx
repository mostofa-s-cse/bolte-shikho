'use client'

import { useTransition } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { toggleTask } from '@/app/plan/actions'

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

  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
      {tasks.map((task, i) => (
        <label key={i} className="flex items-start gap-3 p-3">
          <Checkbox
            checked={checked[i] ?? false}
            onChange={(e) => {
              const isChecked = e.target.checked
              startTransition(() => {
                toggleTask(day, i, isChecked, tasks.length)
              })
            }}
          />
          <span className={checked[i] ? 'font-bengali text-ink-muted line-through' : 'font-bengali'}>
            {task}
          </span>
        </label>
      ))}
    </div>
  )
}
