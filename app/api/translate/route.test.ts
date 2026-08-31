import { describe, it, expect, vi, afterEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/translate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
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

  it('calls MyMemory with the correct langpair and returns its translation', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ responseData: { translatedText: 'হ্যালো' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    const body = await response.json()

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('langpair=en%7Cbn'))
    expect(body).toEqual({ translatedText: 'হ্যালো' })
  })

  it('returns 502 when the upstream call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    expect(response.status).toBe(502)
  })
})
