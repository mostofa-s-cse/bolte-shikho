import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { WordCard } from './word-card'

vi.mock('@/lib/speech', () => ({ speak: vi.fn() }))

describe('WordCard', () => {
  it('shows the English word and, once revealed, the pronunciation and meaning', async () => {
    render(<WordCard word={{ en: 'Red', pron: 'রেড', mean: 'লাল' }} quizMode={true} rate={1} />)
    expect(screen.getByText('Red')).toBeInTheDocument()
    expect(screen.queryByText('রেড')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Red'));
    expect(screen.getByText('রেড')).toBeInTheDocument()
    expect(screen.getByText('লাল', { exact: false })).toBeInTheDocument()
  })

  it('always shows pronunciation and meaning when quiz mode is off', () => {
    render(<WordCard word={{ en: 'Red', pron: 'রেড', mean: 'লাল' }} quizMode={false} rate={1} />)
    expect(screen.getByText('রেড')).toBeInTheDocument()
  })
})
