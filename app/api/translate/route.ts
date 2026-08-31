import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_LANGS = new Set(['en', 'bn'])
// MyMemory's practical limit is ~500 bytes of query text; 490 chars leaves a
// buffer so a request never silently comes back truncated.
const MAX_TEXT_LENGTH = 490

export async function POST(request: NextRequest) {
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

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(`${from}|${to}`)}`
  const upstream = await fetch(url)
  if (!upstream.ok) {
    return NextResponse.json({ error: 'translation service error' }, { status: 502 })
  }

  const data = await upstream.json()

  // MyMemory answers HTTP 200 even for quota and error conditions, signalling
  // the real outcome in the body's own `responseStatus` field and stuffing an
  // error message into `translatedText`. Trust the body, not the status line.
  // It sends the code as a number or a string depending on the endpoint, so
  // coerce before comparing (Number(undefined) is NaN, which fails the check).
  if (Number(data?.responseStatus) !== 200) {
    return NextResponse.json({ error: 'translation service error' }, { status: 502 })
  }

  const translated = data?.responseData?.translatedText
  if (!translated) {
    return NextResponse.json({ error: 'no translation returned' }, { status: 502 })
  }

  return NextResponse.json({ translatedText: translated })
}
