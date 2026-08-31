import { describe, it, expect } from 'vitest'
import { PLAN_TASKS } from './plan-tasks'

describe('PLAN_TASKS', () => {
  it('has exactly 30 days', () => {
    expect(PLAN_TASKS.length).toBe(30)
  })
  it('every day has at least one task', () => {
    for (const tasks of PLAN_TASKS) {
      expect(tasks.length).toBeGreaterThan(0)
    }
  })
})
