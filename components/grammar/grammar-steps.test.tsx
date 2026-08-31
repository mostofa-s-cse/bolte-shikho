import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GrammarSteps } from './grammar-steps'
import type { GrammarStep } from '@/data/grammar'

const STEPS: GrammarStep[] = [
  {
    number: '১',
    title: 'Present Simple',
    intro: 'test intro',
    blocks: [
      {
        structure: 'Subject + verb',
        examples: [{ en: 'I go.', pron: 'আই গো', mean: 'আমি যাই।' }],
      },
    ],
  },
  {
    number: '৪',
    title: 'Irregular Verb',
    blocks: [],
    table: { headers: ['Base', 'Past'], rows: [['go', 'went']] },
  },
]

describe('GrammarSteps', () => {
  it('renders a step title, its structure, and its examples', () => {
    render(<GrammarSteps steps={STEPS} />)
    expect(screen.getByText('Present Simple')).toBeInTheDocument()
    expect(screen.getByText('Subject + verb')).toBeInTheDocument()
    expect(screen.getByText('I go.')).toBeInTheDocument()
    expect(screen.getByText('আই গো')).toBeInTheDocument()
  })

  it('renders a table when the step has one instead of examples', () => {
    render(<GrammarSteps steps={STEPS} />)
    expect(screen.getByText('Irregular Verb')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'went' })).toBeInTheDocument()
  })
})
