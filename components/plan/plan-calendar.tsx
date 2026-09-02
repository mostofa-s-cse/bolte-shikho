'use client'

import { cn } from '@/lib/utils'
import type { DayStatus } from '@/lib/scoring'
import { dateFromStartOffset } from '@/lib/scoring'
import { useTranslations } from '@/lib/i18n/locale-context'

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
  startDate,
}: {
  totalDays: number
  statuses: DayStatus[]
  today: number
  selected: number
  onSelect: (day: number) => void
  startDate: string
}) {
  const { locale } = useTranslations()
  const intlLocale = locale === 'bn' ? 'bn-BD' : 'en-US'
  // Day boundaries are UTC everywhere else in this app (see lib/scoring.ts),
  // so the weekday/date-of-month shown here must format against UTC too —
  // otherwise a browser west of UTC would show the previous calendar day.
  const weekdayFormatter = new Intl.DateTimeFormat(intlLocale, { weekday: 'short', timeZone: 'UTC' })
  const dateFormatter = new Intl.DateTimeFormat(intlLocale, { day: 'numeric', timeZone: 'UTC' })

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10">
      {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
        const calendarDate = new Date(`${dateFromStartOffset(startDate, day - 1)}T00:00:00Z`)
        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelect(day)}
            className={cn(
              'flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border tabular-nums',
              STATUS_CLASSES[statuses[day - 1]],
              day === today && 'border-2 border-accent',
              day === selected && 'ring-2 ring-ink ring-offset-1'
            )}
          >
            <span className="text-[9px] uppercase opacity-70">{weekdayFormatter.format(calendarDate)}</span>
            <span className="text-sm font-bold">{dateFormatter.format(calendarDate)}</span>
            <span className="text-[9px] opacity-70">{day}</span>
          </button>
        )
      })}
    </div>
  )
}
