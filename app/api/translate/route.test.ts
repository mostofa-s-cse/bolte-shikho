import { describe, it, expect, vi, afterEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { resetRateLimit } from '@/lib/translate/rate-limit'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/translate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function makeRawRequest(body: string) {
  return new NextRequest('http://localhost/api/translate', { method: 'POST', body })
}

function mockTranslateSuccess(translatedText: string) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [[[translatedText, 'original', null, null, 3]], null, 'en'],
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  resetRateLimit()
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

  it('returns 400 when the text is longer than the provider accepts', async () => {
    const response = await POST(makeRequest({ text: 'a'.repeat(491), from: 'en', to: 'bn' }))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'text too long' })
  })

  it('accepts text right at the length limit', async () => {
    vi.stubGlobal('fetch', mockTranslateSuccess('ok'))
    const response = await POST(makeRequest({ text: 'a'.repeat(490), from: 'en', to: 'bn' }))
    expect(response.status).toBe(200)
  })

  it('returns 400 for a malformed JSON body instead of throwing', async () => {
    const response = await POST(makeRawRequest('{not json'))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'invalid request body' })
  })

  it('calls the primary provider with the correct source/target languages and returns its translation', async () => {
    const fetchMock = mockTranslateSuccess('হ্যালো')
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    const body = await response.json()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/sl=en.*tl=bn/),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(body).toEqual({ translatedText: 'হ্যালো' })
  })

  it('falls back to Hugging Face when the primary provider fails', async () => {
    vi.stubEnv('HUGGINGFACE_API_TOKEN', 'test-token')
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ translation_text: 'হ্যালো' }] })
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ translatedText: 'হ্যালো' })
  })

  it('returns 503 (busy) when both providers fail, never a wrong-but-confident answer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: 'translation service busy, try again later' })
  })

  it('returns 429 when the same client exceeds the rate limit', async () => {
    vi.stubGlobal('fetch', mockTranslateSuccess('ok'))
    for (let i = 0; i < 20; i++) {
      await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    }
    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    expect(response.status).toBe(429)
  })
})
