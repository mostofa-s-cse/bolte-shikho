import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NavLinks } from './nav-links'

vi.mock('next/navigation', () => ({
  usePathname: () => '/vocab',
}))

const links = [
  { href: '/vocab', label: 'Vocab' },
  { href: '/grammar', label: 'Grammar' },
]

describe('NavLinks', () => {
  it('renders every link', () => {
    render(<NavLinks links={links} locale="en" />)
    expect(screen.getByRole('link', { name: 'Vocab' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Grammar' })).toBeInTheDocument()
  })

  it('marks the link matching the current path as active', () => {
    render(<NavLinks links={links} locale="en" />)
    const activeButton = screen.getByRole('button', { name: 'Vocab' })
    const inactiveButton = screen.getByRole('button', { name: 'Grammar' })
    expect(activeButton.className).toContain('text-accent')
    expect(inactiveButton.className).not.toContain('text-accent')
  })
})
