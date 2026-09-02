// Only this file knows about the translation provider's request/response
// shape, so it can be swapped later without touching the route.
//
// Uses Google Translate's unofficial `translate_a/single` endpoint: real
// dynamic machine translation (not a translation-memory lookup), free, no
// API key, no billing account required. It's unofficial — Google can
// rate-limit or change it without notice — but it's what most free
// open-source translator tools rely on, and it doesn't have MyMemory's
// fuzzy-match-against-cached-sentences failure mode (which can return a
// completely unrelated sentence for a low-resource pair like en<->bn).
//
// A Hugging Face fallback (facebook/nllb-200-distilled-600M) was tried and
// removed: that model isn't hosted on HF's free serverless tier anymore,
// and the free models that ARE actually live for this pair — Helsinki-NLP's
// opus-mt-bn-en and opus-mt-en-mul — were tested live and gave genuinely
// wrong translations (e.g. "Dhaka" mistranslated as a word for "robber").
// Per this app's own rule, a translation must never be confidently wrong —
// a clean "busy, try again" error is the correct behavior when the primary
// provider fails, not a fallback to a lower-quality engine.
//
// The only way to get a stable, verified-correct fallback is an official
// paid-tier-gated API (Google Cloud Translation, Azure Translator) —
// both require a billing-enabled account, which isn't available right now.
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
    return { error: 'translation service busy, try again later', status: 503 }
  } finally {
    clearTimeout(timeout)
  }

  if (!upstream.ok) {
    return { error: 'translation service busy, try again later', status: 503 }
  }

  const data = await upstream.json()

  // The response is a deeply nested array, not an object: data[0] is a list
  // of [translatedChunk, originalChunk, ...] pairs — one per sentence/segment
  // the engine split the input into. Join the translated chunks back into
  // one string.
  const segments = data?.[0]
  if (!Array.isArray(segments) || segments.length === 0) {
    return { error: 'translation service busy, try again later', status: 503 }
  }

  const translated = segments.map((segment: unknown) => (Array.isArray(segment) ? segment[0] : '') ?? '').join('')
  if (!translated) {
    return { error: 'translation service busy, try again later', status: 503 }
  }

  return { translatedText: translated }
}
