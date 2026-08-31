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
  // The UI uses lucide icons, not emoji — task copy must not reference a
  // speaker emoji that appears nowhere on screen.
  it('has no emoji in the task copy', () => {
    for (const task of PLAN_TASKS.flat()) {
      expect(task).not.toMatch(/\p{Extended_Pictographic}/u)
    }
  })
})
