import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HoverLift } from './hover-lift'

describe('HoverLift', () => {
  it('renders its children', () => {
    render(
      <HoverLift>
        <button type="button">Go</button>
      </HoverLift>
    )
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
  })
})
