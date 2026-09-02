import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { translateText } from './provider'

beforeEach(() => {
  vi.stubEnv('AZURE_TRANSLATOR_KEY', 'test-key')
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
        json: async () => [{ translations: [{ text: 'হ্যালো', to: 'bn' }] }],
      })
    )
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ translatedText: 'হ্যালো' })
  })

  it('returns an error when the API key is not configured', async () => {
    vi.stubEnv('AZURE_TRANSLATOR_KEY', '')
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ error: 'translation service not configured', status: 500 })
  })

  it('sends the subscription key and region headers', async () => {
    vi.stubEnv('AZURE_TRANSLATOR_REGION', 'eastus')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ translations: [{ text: 'ok', to: 'bn' }] }],
    })
    vi.stubGlobal('fetch', fetchMock)

    await translateText('hello', 'en', 'bn')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/from=en.*to=bn/),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Ocp-Apim-Subscription-Key': 'test-key',
          'Ocp-Apim-Subscription-Region': 'eastus',
        }),
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
        json: async () => [{ translations: [] }],
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
