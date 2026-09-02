import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
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
})
