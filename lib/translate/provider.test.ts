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
        json: async () => [[['হ্যালো', 'hello', null, null, 3]], null, 'en'],
      })
    )
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ translatedText: 'হ্যালো' })
  })

  it('joins multiple sentence segments into one string', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          [
            ['হ্যালো। ', 'Hello. ', null, null, 3],
            ['তুমি কেমন আছো?', 'How are you?', null, null, 3],
          ],
          null,
          'en',
        ],
      })
    )
    const result = await translateText('Hello. How are you?', 'en', 'bn')
    expect(result).toEqual({ translatedText: 'হ্যালো। তুমি কেমন আছো?' })
  })

  it('returns a 502 error when the upstream call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ error: 'translation service error', status: 502 })
  })

  it('returns a 502 error when the upstream returns no segments', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [null, null, 'en'],
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
