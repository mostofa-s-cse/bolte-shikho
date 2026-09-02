import { describe, it, expect, vi, afterEach } from 'vitest'
import { translateText } from './provider'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('translateText', () => {
  it('returns the translated text on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ responseStatus: 200, responseData: { translatedText: 'হ্যালো' } }),
      })
    )
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ translatedText: 'হ্যালো' })
  })

  it('returns a 502 error when the upstream call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ error: 'translation service error', status: 502 })
  })

  it('returns a 502 error when the upstream returns no translation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ responseStatus: 200, responseData: {} }),
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
