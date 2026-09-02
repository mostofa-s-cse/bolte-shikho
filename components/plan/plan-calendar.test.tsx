import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PlanCalendar } from './plan-calendar'
import { LocaleProvider } from '@/lib/i18n/locale-context'
import { DICTIONARIES } from '@/lib/i18n/dictionary'
import type { DayStatus } from '@/lib/scoring'

function renderCalendar(props: Omit<Parameters<typeof PlanCalendar>[0], 'startDate'> & { startDate?: string }) {
  return render(
    <LocaleProvider dict={DICTIONARIES.bn} locale="bn">
      {/* Offset from the 1st so date-of-month (25, 26, 27) never collides
          with the plan-day count (1, 2, 3) also shown in each cell. */}
      <PlanCalendar startDate="2026-08-25" {...props} />
    </LocaleProvider>
  )
}

describe('PlanCalendar', () => {
  it('renders one cell per day and marks the selected day', () => {
    const statuses: DayStatus[] = ['done-ontime', 'partial', 'future']
    const { container } = renderCalendar({ totalDays: 3, statuses, today: 1, selected: 2, onSelect: () => {} })
    const buttons = container.querySelectorAll('button')

    expect(buttons).toHaveLength(3)
    expect(buttons[0].textContent).toContain('1') // plan-day count
    expect(buttons[1].textContent).toContain('2')
    expect(buttons[2].textContent).toContain('3')
    expect(buttons[1]).toHaveClass('ring-2')
  })

  it('shows the real calendar date and weekday for each day, counting from startDate', () => {
    const statuses: DayStatus[] = ['done-ontime', 'partial', 'future']
    // 2026-08-30 (Sunday) is plan day 1, so date-of-month (30, 31, 1) never
    // collides with the plan-day count (1, 2, 3) shown in the same cell.
    const { container } = renderCalendar({
      totalDays: 3,
      statuses,
      today: 1,
      selected: 1,
      onSelect: () => {},
      startDate: '2026-08-30',
    })
    const buttons = container.querySelectorAll('button')

    // bn-BD formats numbers with Bangla digits (০-৯), matching the rest of
    // this app's Bangla UI (e.g. "৩০ দিনের পরিকল্পনা" elsewhere).
    expect(buttons[0].textContent).toContain('৩০') // date-of-month for plan day 1
    expect(buttons[0].textContent).toMatch(/রবি/) // Sunday in Bangla
    expect(buttons[1].textContent).toContain('৩১') // 2026-08-31
    expect(buttons[2].textContent).toContain('১') // month rolls over to September 1
  })
})
