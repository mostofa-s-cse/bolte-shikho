import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { PromptCard } from './prompt-card'

describe('PromptCard', () => {
  it('shows one of the given prompts and swaps to another on click', async () => {
    const prompts = ['Prompt A', 'Prompt B']
    render(<PromptCard prompts={prompts} />)
    expect(prompts).toContain(screen.getByTestId('prompt-text').textContent)

    await userEvent.click(screen.getByRole('button', { name: 'Notun Prompt' }))
    expect(prompts).toContain(screen.getByTestId('prompt-text').textContent)
  })
})
