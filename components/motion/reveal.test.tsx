import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Reveal } from './reveal'

describe('Reveal', () => {
  it('renders its children', () => {
    render(
      <Reveal>
        <p>Content</p>
      </Reveal>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders children as a plain, unwrapped element when reduced motion is preferred', async () => {
    vi.resetModules()
    vi.doMock('framer-motion', async () => {
      const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
      return { ...actual, useReducedMotion: () => true }
    })
    const { Reveal: ReducedReveal } = await import('./reveal')

    const { container } = render(
      <ReducedReveal>
        <p>Content</p>
      </ReducedReveal>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
    // No motion wrapper div with an inline animation style should exist.
    expect(container.querySelector('[style*="opacity"]')).not.toBeInTheDocument()

    vi.doUnmock('framer-motion')
  })
})
