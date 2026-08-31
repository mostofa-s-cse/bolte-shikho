'use client'

import { cn } from '@/lib/utils'
import type { DayStatus } from '@/lib/scoring'

const STATUS_CLASSES: Record<DayStatus, string> = {
  'done-ontime': 'bg-good border-good text-white',
  'done-late': 'bg-accent border-accent text-accent-ink',
  partial: 'bg-surface-alt border-border text-ink',
  missed: 'border-dashed border-bad text-bad bg-transparent',
  future: 'border-border text-ink-muted opacity-50',
}

export function PlanCalendar({
  totalDays,
  statuses,
  today,
  selected,
  onSelect,
}: {
  totalDays: number
  statuses: DayStatus[]
  today: number
  selected: number
  onSelect: (day: number) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10">
      {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => onSelect(day)}
          className={cn(
            'aspect-square cursor-pointer rounded-lg border text-xs font-semibold tabular-nums',
            STATUS_CLASSES[statuses[day - 1]],
            day === today && 'border-2 border-accent',
            day === selected && 'ring-2 ring-ink ring-offset-1'
          )}
        >
          {day}
        </button>
      ))}
    </div>
  )
}
