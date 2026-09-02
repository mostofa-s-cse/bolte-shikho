import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ParrotMascot } from './parrot-mascot'

describe('ParrotMascot', () => {
  it('renders an svg for the idle pose', () => {
    render(<ParrotMascot pose="idle" />)
    const svg = screen.getByTestId('parrot-mascot')
    expect(svg.tagName.toLowerCase()).toBe('svg')
  })

  it('is decorative and hidden from assistive tech', () => {
    render(<ParrotMascot pose="idle" />)
    expect(screen.getByTestId('parrot-mascot')).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies a passed className for sizing', () => {
    render(<ParrotMascot pose="idle" className="h-24 w-24" />)
    expect(screen.getByTestId('parrot-mascot')).toHaveClass('h-24', 'w-24')
  })
})
