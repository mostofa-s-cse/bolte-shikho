import { NextRequest, NextResponse } from 'next/server'
import { translateText } from '@/lib/translate/provider'
import { isRateLimited } from '@/lib/translate/rate-limit'

const SUPPORTED_LANGS = new Set(['en', 'bn'])
// MyMemory's practical limit is ~500 bytes of query text; 490 chars leaves a
// buffer so a request never silently comes back truncated.
const MAX_TEXT_LENGTH = 490

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 })
  }

  const { text, from, to } = (body ?? {}) as { text?: string; from?: string; to?: string }

  if (!text || !text.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: 'text too long' }, { status: 400 })
  }
  if (!from || !to || !SUPPORTED_LANGS.has(from) || !SUPPORTED_LANGS.has(to)) {
    return NextResponse.json({ error: 'invalid language code' }, { status: 400 })
  }
  if (from === to) {
    return NextResponse.json(
      { error: 'source and target language must differ' },
      { status: 400 }
    )
  }

  const result = await translateText(text, from, to)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ translatedText: result.translatedText })
}
