// Only this file knows about the translation provider's request/response
// shape and credentials, so it can be swapped later without touching the
// route.
//
// Uses Azure AI Translator (Microsoft Cognitive Services) — official,
// documented, and stable, with a genuine free tier (2M characters/month).
// Requires AZURE_TRANSLATOR_KEY (and AZURE_TRANSLATOR_REGION for a
// region-scoped resource) in .env.local, read only on the server — never
// exposed to the client.
const TIMEOUT_MS = 8000
const ENDPOINT = 'https://api.cognitive.microsofttranslator.com/translate'

export type TranslateResult = { translatedText: string } | { error: string; status: number }

export async function translateText(text: string, from: string, to: string): Promise<TranslateResult> {
  const key = process.env.AZURE_TRANSLATOR_KEY
  if (!key) {
    return { error: 'translation service not configured', status: 500 }
  }
  const region = process.env.AZURE_TRANSLATOR_REGION

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let upstream: Response
  try {
    const url = `${ENDPOINT}?api-version=3.0&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    upstream = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': key,
        ...(region ? { 'Ocp-Apim-Subscription-Region': region } : {}),
      },
      body: JSON.stringify([{ text }]),
    })
  } catch {
    return { error: 'translation service error', status: 502 }
  } finally {
    clearTimeout(timeout)
  }

  if (!upstream.ok) {
    return { error: 'translation service error', status: 502 }
  }

  // Azure answers with an array, one entry per input item — we only ever
  // send one: [{ translations: [{ text, to }] }]
  const data = await upstream.json()
  const translated = data?.[0]?.translations?.[0]?.text
  if (!translated) {
    return { error: 'no translation returned', status: 502 }
  }

  return { translatedText: translated }
}
