import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@/components/theme-provider'
import { LocaleProvider } from '@/lib/i18n/locale-context'
import { DICTIONARIES } from '@/lib/i18n/dictionary'
import { ThemeToggle } from './theme-toggle'

describe('ThemeToggle', () => {
  it('toggles the aria-pressed state when clicked', async () => {
    render(
      <LocaleProvider dict={DICTIONARIES.bn} locale="bn">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeToggle />
        </ThemeProvider>
      </LocaleProvider>
    )
    const button = await screen.findByRole('button', { name: DICTIONARIES.bn.header.toggleTheme })
    const before = button.getAttribute('aria-pressed')
    await userEvent.click(button)
    expect(button.getAttribute('aria-pressed')).not.toBe(before)
  })
})
