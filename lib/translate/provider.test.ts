import { describe, it, expect, vi, afterEach } from 'vitest'
import { translateText } from './provider'

function geminiResponse(translatedText: string) {
  return {
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text: translatedText }] } }] }),
  }
}

function googleResponse(translatedText: string) {
  return { ok: true, json: async () => [[[translatedText, 'original', null, null, 3]], null, 'en'] }
}

function failed() {
  return { ok: false }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('translateText', () => {
  it('uses Gemini when a key is configured', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    const fetchMock = vi.fn().mockResolvedValue(geminiResponse('হ্যালো'))
    vi.stubGlobal('fetch', fetchMock)

    const result = await translateText('hello', 'en', 'bn')

    expect(result).toEqual({ translatedText: 'হ্যালো' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-goog-api-key': 'test-key' }),
      })
    )
  })

  it('names both languages in the prompt it sends to Gemini', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    const fetchMock = vi.fn().mockResolvedValue(geminiResponse('ok'))
    vi.stubGlobal('fetch', fetchMock)

    await translateText('hello', 'bn', 'en')

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.contents[0].parts[0].text).toContain('from Bengali to English')
  })

  it('trims whitespace from Gemini output', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(geminiResponse('  হ্যালো\n')))
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ translatedText: 'হ্যালো' })
  })

  it('skips a thinking-only part and takes the part carrying the translation', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ thoughtSignature: 'abc' }, { text: 'হ্যালো' }],
              },
            },
          ],
        }),
      })
    )
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ translatedText: 'হ্যালো' })
  })

  it('asks Gemini for low thinking effort rather than full reasoning', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    const fetchMock = vi.fn().mockResolvedValue(geminiResponse('ok'))
    vi.stubGlobal('fetch', fetchMock)

    await translateText('hello', 'en', 'bn')

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.generationConfig.thinkingConfig).toEqual({ thinkingLevel: 'low' })
  })

  it('skips Gemini entirely when no key is configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue(googleResponse('হ্যালো'))
    vi.stubGlobal('fetch', fetchMock)

    const result = await translateText('hello', 'en', 'bn')

    expect(result).toEqual({ translatedText: 'হ্যালো' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('translate.googleapis.com'),
      expect.anything()
    )
  })

  it('falls back to the unofficial endpoint when Gemini hits its quota', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(failed())
      .mockResolvedValueOnce(googleResponse('হ্যালো'))
    vi.stubGlobal('fetch', fetchMock)

    const result = await translateText('hello', 'en', 'bn')

    expect(result).toEqual({ translatedText: 'হ্যালো' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('joins multiple sentence segments from the unofficial endpoint', async () => {
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

  it('returns a busy error when every provider fails, never a wrong answer', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(failed()))
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ error: 'translation service busy, try again later', status: 503 })
  })

  it('returns a busy error when the requests time out', async () => {
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
    expect(result).toEqual({ error: 'translation service busy, try again later', status: 503 })
  })
})
