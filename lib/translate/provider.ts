// Only this file knows about the translation provider's request/response
// shape and credentials, so it can be swapped later without touching the
// route.
//
// Uses the Google Cloud Translation API (Basic, v2) — official, documented,
// and stable, with a genuine free tier (500,000 characters/month).
// Requires GOOGLE_TRANSLATE_API_KEY in .env.local, read only on the server —
// never exposed to the client.
const TIMEOUT_MS = 8000
const ENDPOINT = 'https://translation.googleapis.com/language/translate/v2'

export type TranslateResult = { translatedText: string } | { error: string; status: number }

export async function translateText(text: string, from: string, to: string): Promise<TranslateResult> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!key) {
    return { error: 'translation service not configured', status: 500 }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let upstream: Response
  try {
    upstream = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: from, target: to, format: 'text' }),
    })
  } catch {
    return { error: 'translation service error', status: 502 }
  } finally {
    clearTimeout(timeout)
  }

  if (!upstream.ok) {
    return { error: 'translation service error', status: 502 }
  }

  const data = await upstream.json()
  const translated = data?.data?.translations?.[0]?.translatedText
  if (!translated) {
    return { error: 'no translation returned', status: 502 }
  }

  return { translatedText: translated }
}
