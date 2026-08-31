import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { PromptCard } from './prompt-card'
import { renderWithLocale } from '@/test/render-with-locale'
import { DICTIONARIES } from '@/lib/i18n/dictionary'

describe('PromptCard', () => {
  it('shows one of the given prompts and swaps to another on click', async () => {
    const prompts = ['Prompt A', 'Prompt B']
    renderWithLocale(<PromptCard prompts={prompts} />)
    expect(prompts).toContain(screen.getByTestId('prompt-text').textContent)

    await userEvent.click(screen.getByRole('button', { name: DICTIONARIES.bn.practice.prompt.next }))
    expect(prompts).toContain(screen.getByTestId('prompt-text').textContent)
  })
})
