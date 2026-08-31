import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toggleTask } from '@/app/plan/actions'
import { PlanTaskList } from './plan-task-list'

vi.mock('@/app/plan/actions', () => ({ toggleTask: vi.fn() }))

describe('PlanTaskList', () => {
  beforeEach(() => {
    vi.mocked(toggleTask).mockReset()
  })

  it('checks the box optimistically while the action is still pending', async () => {
    // Never resolves, so the box can only appear checked via the optimistic
    // update — the `checked` prop stays false the whole time.
    vi.mocked(toggleTask).mockImplementation(() => new Promise<void>(() => {}))

    render(<PlanTaskList day={1} tasks={['Task one', 'Task two']} checked={[false, false]} />)
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes[0]).not.toBeChecked()

    await userEvent.click(boxes[0])

    expect(boxes[0]).toBeChecked()
    expect(boxes[1]).not.toBeChecked()
    expect(toggleTask).toHaveBeenCalledWith(1, 0, true, 2)
  })

  it('renders the server-confirmed checked state', () => {
    render(<PlanTaskList day={2} tasks={['Task one', 'Task two']} checked={[true, false]} />)
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes[0]).toBeChecked()
    expect(boxes[1]).not.toBeChecked()
  })
})
