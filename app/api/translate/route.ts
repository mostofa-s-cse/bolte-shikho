import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_LANGS = new Set(['en', 'bn'])

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { text, from, to } = body as { text?: string; from?: string; to?: string }

  if (!text || !text.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }
  if (!from || !to || !SUPPORTED_LANGS.has(from) || !SUPPORTED_LANGS.has(to)) {
    return NextResponse.json({ error: 'invalid language code' }, { status: 400 })
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(`${from}|${to}`)}`
  const upstream = await fetch(url)
  if (!upstream.ok) {
    return NextResponse.json({ error: 'translation service error' }, { status: 502 })
  }

  const data = await upstream.json()
  const translated = data?.responseData?.translatedText
  if (!translated) {
    return NextResponse.json({ error: 'no translation returned' }, { status: 502 })
  }

  return NextResponse.json({ translatedText: translated })
}
