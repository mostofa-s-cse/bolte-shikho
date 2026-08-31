import { describe, it, expect } from 'vitest'
import { dateFromStartOffset, getCurrentPlanDay, computeDayStatus, computeScore } from './scoring'

describe('dateFromStartOffset', () => {
  it('adds the offset in days to the start date', () => {
    expect(dateFromStartOffset('2026-08-30', 0)).toBe('2026-08-30')
    expect(dateFromStartOffset('2026-08-30', 1)).toBe('2026-08-31')
    expect(dateFromStartOffset('2026-08-30', 29)).toBe('2026-09-28')
  })
})

describe('getCurrentPlanDay', () => {
  it('is day 1 on the start date', () => {
    expect(getCurrentPlanDay('2026-08-30', 30, '2026-08-30')).toBe(1)
  })
  it('advances one day per calendar day', () => {
    expect(getCurrentPlanDay('2026-08-30', 30, '2026-09-02')).toBe(4)
  })
  it('clamps at the total day count', () => {
    expect(getCurrentPlanDay('2026-08-30', 30, '2027-01-01')).toBe(30)
  })
})

describe('computeDayStatus', () => {
  const base = { startDate: '2026-08-30', dayNumber: 1, taskCount: 4 }

  it('is "future" for a day that has not arrived yet', () => {
    expect(
      computeDayStatus({ ...base, dayNumber: 5, checkedCount: 0, completedDate: null, today: '2026-08-30' })
    ).toBe('future')
  })

  it('is "missed" for a past day with nothing checked', () => {
    expect(
      computeDayStatus({ ...base, checkedCount: 0, completedDate: null, today: '2026-09-05' })
    ).toBe('missed')
  })

  it('is "partial" for a past day with some tasks checked', () => {
    expect(
      computeDayStatus({ ...base, checkedCount: 2, completedDate: null, today: '2026-09-05' })
    ).toBe('partial')
  })

  it('is "done-ontime" when finished on or before its scheduled date', () => {
    expect(
      computeDayStatus({ ...base, checkedCount: 4, completedDate: '2026-08-30', today: '2026-08-30' })
    ).toBe('done-ontime')
  })

  it('is "done-late" when finished after its scheduled date', () => {
    expect(
      computeDayStatus({ ...base, checkedCount: 4, completedDate: '2026-09-02', today: '2026-09-02' })
    ).toBe('done-late')
  })
})

describe('computeScore', () => {
  it('awards 10 points per checked task', () => {
    const { score } = computeScore([
      { taskCount: 4, checkedCount: 2, scheduledDate: '2026-08-30', completedDate: null },
    ])
    expect(score).toBe(20)
  })

  it('adds a 20-point bonus for a fully completed day', () => {
    const { score } = computeScore([
      { taskCount: 4, checkedCount: 4, scheduledDate: '2026-08-30', completedDate: '2026-09-05' },
    ])
    expect(score).toBe(4 * 10 + 20)
  })

  it('adds a further 10-point bonus and counts it when completed on time', () => {
    const { score, doneOnTime } = computeScore([
      { taskCount: 4, checkedCount: 4, scheduledDate: '2026-08-30', completedDate: '2026-08-30' },
    ])
    expect(score).toBe(4 * 10 + 20 + 10)
    expect(doneOnTime).toBe(1)
  })
})
