import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders children and applies the primary variant by default', () => {
    render(<Button>Shuru Koro</Button>)
    const button = screen.getByRole('button', { name: 'Shuru Koro' })
    expect(button).toBeInTheDocument()
    expect(button.className).toContain('bg-accent')
  })

  it('applies the ghost variant when requested', () => {
    render(<Button variant="ghost">Cancel</Button>)
    const button = screen.getByRole('button', { name: 'Cancel' })
    expect(button.className).not.toContain('bg-accent')
  })
})
