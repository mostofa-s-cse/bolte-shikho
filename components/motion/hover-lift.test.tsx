import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
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

  it('renders children as a plain, unwrapped element when reduced motion is preferred', async () => {
    vi.doMock('framer-motion', async () => {
      const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
      return { ...actual, useReducedMotion: () => true }
    })
    const { HoverLift: ReducedHoverLift } = await import('./hover-lift')

    render(
      <ReducedHoverLift>
        <button type="button">Go</button>
      </ReducedHoverLift>
    )
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()

    vi.doUnmock('framer-motion')
  })
})
