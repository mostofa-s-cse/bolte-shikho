import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from './theme-toggle'

describe('ThemeToggle', () => {
  it('toggles the aria-pressed state when clicked', async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>
    )
    const button = await screen.findByRole('button', { name: /theme/i })
    const before = button.getAttribute('aria-pressed')
    await userEvent.click(button)
    expect(button.getAttribute('aria-pressed')).not.toBe(before)
  })
})
