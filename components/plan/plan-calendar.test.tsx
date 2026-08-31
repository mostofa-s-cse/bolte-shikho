import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PlanCalendar } from './plan-calendar'
import type { DayStatus } from '@/lib/scoring'

describe('PlanCalendar', () => {
  it('renders one cell per day and marks the selected day', () => {
    const statuses: DayStatus[] = ['done-ontime', 'partial', 'future']
    render(<PlanCalendar totalDays={3} statuses={statuses} today={1} selected={2} onSelect={() => {}} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2').closest('button')).toHaveClass('ring-2')
  })
})
