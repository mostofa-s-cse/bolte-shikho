import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { translateText } from './provider'

function googleResponse(translatedText: string) {
  return { ok: true, json: async () => [[[translatedText, 'original', null, null, 3]], null, 'en'] }
}

function googleBlocked() {
  return { ok: false }
}

function hfResponse(translatedText: string) {
  return { ok: true, json: async () => [{ translation_text: translatedText }] }
}

function hfLoading() {
  return { ok: false }
}

beforeEach(() => {
  vi.stubEnv('HUGGINGFACE_API_TOKEN', 'test-token')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('translateText', () => {
  it('returns Google\'s translation when it succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(googleResponse('হ্যালো')))
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ translatedText: 'হ্যালো' })
  })

  it('falls back to Hugging Face when Google fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(googleBlocked())
      .mockResolvedValueOnce(hfResponse('হ্যালো'))
    vi.stubGlobal('fetch', fetchMock)

    const result = await translateText('hello', 'en', 'bn')

    expect(result).toEqual({ translatedText: 'হ্যালো' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('sends NLLB-200 language codes and the bearer token to Hugging Face', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(googleBlocked()).mockResolvedValueOnce(hfResponse('ok'))
    vi.stubGlobal('fetch', fetchMock)

    await translateText('hello', 'en', 'bn')

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        body: JSON.stringify({
          inputs: 'hello',
          parameters: { src_lang: 'eng_Latn', tgt_lang: 'ben_Beng' },
        }),
      })
    )
  })

  it('returns a busy error when both providers fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(googleBlocked()))
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ error: 'translation service busy, try again later', status: 503 })
  })

  it('returns a busy error when Google fails and Hugging Face has no token configured', async () => {
    vi.stubEnv('HUGGINGFACE_API_TOKEN', '')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(googleBlocked()))
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ error: 'translation service busy, try again later', status: 503 })
  })

  it('returns a busy error when both providers time out', async () => {
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
    await vi.advanceTimersByTimeAsync(8000)
    const result = await promise
    expect(result).toEqual({ error: 'translation service busy, try again later', status: 503 })
    vi.useRealTimers()
  })
})

describe('translateWithHuggingFace via translateText (Google unreachable)', () => {
  it('treats a loading (503) model as a failure, not a crash', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(googleBlocked()).mockResolvedValueOnce(hfLoading()))
    const result = await translateText('hello', 'en', 'bn')
    expect(result).toEqual({ error: 'translation service busy, try again later', status: 503 })
  })
})
