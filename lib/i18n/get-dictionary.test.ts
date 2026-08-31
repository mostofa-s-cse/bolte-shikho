import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/navigation', () => ({ notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }) }))
vi.mock('next/root-params', () => ({ lang: vi.fn() }))

describe('getDictionary', () => {
  it('resolves the bn dictionary for locale bn', async () => {
    const { lang } = await import('next/root-params')
    vi.mocked(lang).mockResolvedValue('bn')
    const { getDictionary } = await import('./get-dictionary')
    const dict = await getDictionary()
    expect(dict.nav.vocab).toBe('শব্দ')
  })

  it('resolves the en dictionary for locale en', async () => {
    const { lang } = await import('next/root-params')
    vi.mocked(lang).mockResolvedValue('en')
    const { getDictionary } = await import('./get-dictionary')
    const dict = await getDictionary()
    expect(dict.nav.vocab).toBe('Vocab')
  })

  it('calls notFound for an unknown locale', async () => {
    const { lang } = await import('next/root-params')
    vi.mocked(lang).mockResolvedValue('fr')
    const { getDictionary } = await import('./get-dictionary')
    await expect(getDictionary()).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
