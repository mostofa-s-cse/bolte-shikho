import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { translateText } from './provider'

beforeEach(() => {
  vi.stubEnv('GOOGLE_TRANSLATE_API_KEY', 'test-key')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('translateText', () => {
  it('returns the translated text on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { translations: [{ translatedText: 'হ্যালো' }] } }),
      })
    )
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ translatedText: 'হ্যালো' })
  })

  it('returns an error when the API key is not configured', async () => {
    vi.stubEnv('GOOGLE_TRANSLATE_API_KEY', '')
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ error: 'translation service not configured', status: 500 })
  })

  it('sends the API key and request body correctly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { translations: [{ translatedText: 'ok' }] } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await translateText('hello', 'en', 'bn')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('key=test-key'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ q: 'hello', source: 'en', target: 'bn', format: 'text' }),
      })
    )
  })

  it('returns a 502 error when the upstream call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ error: 'translation service error', status: 502 })
  })

  it('returns a 502 error when the response has no translation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { translations: [] } }),
      })
    )
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ error: 'no translation returned', status: 502 })
  })

  it('returns a 502 error when the request times out', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        })
      })
    )
    const promise = translateText('hello', 'en', 'bn')
    await vi.advanceTimersByTimeAsync(8000)
    const result = await promise
    expect(result).toEqual({ error: 'translation service error', status: 502 })
  })
})
