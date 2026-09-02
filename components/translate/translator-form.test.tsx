import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { TranslatorForm } from './translator-form'
import { renderWithLocale } from '@/test/render-with-locale'
import { DICTIONARIES } from '@/lib/i18n/dictionary'

vi.mock('@/lib/speech', () => ({ speak: vi.fn(), createRecognition: () => null }))

const t = DICTIONARIES.bn.translate

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TranslatorForm', () => {
  it('keeps the typed text when swapping direction before translating', async () => {
    renderWithLocale(<TranslatorForm />)
    const textarea = screen.getByPlaceholderText(t.placeholder)

    await userEvent.type(textarea, 'hello')
    await userEvent.click(screen.getByRole('button', { name: t.swap }))

    // Swapping only sets the direction here — it must not clear the input,
    // which used to leave the user with an empty box and a dead button.
    expect(textarea).toHaveValue('hello')
    expect(screen.getByLabelText(t.sourceLang)).toHaveValue('bn')
    expect(screen.getByLabelText(t.targetLang)).toHaveValue('en')
  })

  it('moves the translation back into the input when swapping after translating', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ translatedText: 'হ্যালো' }),
      })
    )

    renderWithLocale(<TranslatorForm />)
    const textarea = screen.getByPlaceholderText(t.placeholder)

    await userEvent.type(textarea, 'hello')
    await userEvent.click(screen.getByRole('button', { name: t.translateButton }))
    await waitFor(() => expect(screen.getByText('হ্যালো')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: t.swap }))

    expect(textarea).toHaveValue('হ্যালো')
  })

  it('sends the selected direction to the API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ translatedText: 'I am fine today' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    renderWithLocale(<TranslatorForm />)
    const textarea = screen.getByPlaceholderText(t.placeholder)

    await userEvent.selectOptions(screen.getByLabelText(t.sourceLang), 'bn')
    await userEvent.type(textarea, 'আমি আজ ভালো আছি')
    await userEvent.click(screen.getByRole('button', { name: t.translateButton }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toMatchObject({ from: 'bn', to: 'en', text: 'আমি আজ ভালো আছি' })
  })
})
