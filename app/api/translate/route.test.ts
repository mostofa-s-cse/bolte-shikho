import { describe, it, expect, vi, afterEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/translate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function makeRawRequest(body: string) {
  return new NextRequest('http://localhost/api/translate', { method: 'POST', body })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('POST /api/translate', () => {
  it('returns 400 when text is missing', async () => {
    const response = await POST(makeRequest({ text: '', from: 'en', to: 'bn' }))
    expect(response.status).toBe(400)
  })

  it('returns 400 for an unsupported language code', async () => {
    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'fr' }))
    expect(response.status).toBe(400)
  })

  it('returns 400 when source and target language are the same', async () => {
    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'en' }))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'source and target language must differ' })
  })

  it('returns 400 when the text is longer than MyMemory accepts', async () => {
    const response = await POST(makeRequest({ text: 'a'.repeat(491), from: 'en', to: 'bn' }))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'text too long' })
  })

  it('accepts text right at the length limit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ responseStatus: 200, responseData: { translatedText: 'ok' } }),
      })
    )
    const response = await POST(makeRequest({ text: 'a'.repeat(490), from: 'en', to: 'bn' }))
    expect(response.status).toBe(200)
  })

  it('returns 400 for a malformed JSON body instead of throwing', async () => {
    const response = await POST(makeRawRequest('{not json'))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'invalid request body' })
  })

  it('calls MyMemory with the correct langpair and returns its translation', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ responseStatus: 200, responseData: { translatedText: 'হ্যালো' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    const body = await response.json()

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('langpair=en%7Cbn'))
    expect(body).toEqual({ translatedText: 'হ্যালো' })
  })

  it('accepts a stringified responseStatus', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ responseStatus: '200', responseData: { translatedText: 'হ্যালো' } }),
      })
    )
    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    expect(response.status).toBe(200)
  })

  it('returns 502 when the upstream call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    expect(response.status).toBe(502)
  })

  it('returns 502 when MyMemory answers HTTP 200 with a non-200 responseStatus', async () => {
    // The real quota-exceeded shape: HTTP 200, error text in translatedText.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          responseStatus: 429,
          responseData: {
            translatedText:
              'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY.',
          },
        }),
      })
    )

    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ error: 'translation service error' })
  })

  it('returns 502 when the body carries no responseStatus at all', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ responseData: { translatedText: 'হ্যালো' } }),
      })
    )
    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    expect(response.status).toBe(502)
  })
})
