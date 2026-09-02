// Only this file knows about the translation provider's request/response
// shape, so it can be swapped later without touching the route.
//
// Uses Google Translate's unofficial `translate_a/single` endpoint: real
// dynamic machine translation (not a translation-memory lookup), free, no
// API key, no billing account required. It's unofficial — Google could
// rate-limit or change it without notice — but it's what most free
// open-source translator tools rely on, and it doesn't have MyMemory's
// fuzzy-match-against-cached-sentences failure mode (which can return a
// completely unrelated sentence for a low-resource pair like en<->bn).
//
// The official alternatives (Google Cloud Translation, Azure Translator)
// are more stable but require a billing-enabled cloud account even for
// their free tiers — not an option without a card.
const TIMEOUT_MS = 8000

export type TranslateResult = { translatedText: string } | { error: string; status: number }

export async function translateText(text: string, from: string, to: string): Promise<TranslateResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let upstream: Response
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`
    upstream = await fetch(url, { signal: controller.signal })
  } catch {
    return { error: 'translation service error', status: 502 }
  } finally {
    clearTimeout(timeout)
  }

  if (!upstream.ok) {
    return { error: 'translation service error', status: 502 }
  }

  const data = await upstream.json()

  // The response is a deeply nested array, not an object: data[0] is a list
  // of [translatedChunk, originalChunk, ...] pairs — one per sentence/segment
  // the engine split the input into. Join the translated chunks back into
  // one string.
  const segments = data?.[0]
  if (!Array.isArray(segments) || segments.length === 0) {
    return { error: 'no translation returned', status: 502 }
  }

  const translated = segments.map((segment: unknown) => (Array.isArray(segment) ? segment[0] : '') ?? '').join('')
  if (!translated) {
    return { error: 'no translation returned', status: 502 }
  }

  return { translatedText: translated }
}
