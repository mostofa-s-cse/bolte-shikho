// Only this file knows about the translation providers' request/response
// shapes and credentials, so they can be changed without touching the route.
//
// Two REAL machine-translation paths are tried in order — never a
// translation-memory/fuzzy-match service like MyMemory, which can return a
// completely unrelated cached sentence with full confidence:
//
// 1. Gemini (Google AI Studio). Best quality for en<->bn by a wide margin,
//    official and documented, and its free tier needs no billing account.
//    Skipped entirely when GEMINI_API_KEY isn't set, so the app still works
//    without one.
// 2. Google Translate's unofficial `translate_a/single` endpoint: free, no
//    signup, real dynamic MT. Used when Gemini is unset or has hit its free
//    daily quota. Unofficial — Google can rate-limit an IP without notice.
//
// If both fail the caller gets a clear "busy, try again" error rather than a
// wrong-but-confident-looking answer.
const TIMEOUT_MS = 8000
// gemini-2.5-flash is no longer available to new API keys — 3.6-flash is
// what Google's own 404 response points new users to.
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash'

export type TranslateResult = { translatedText: string } | { error: string; status: number }

const LANGUAGE_NAMES: Record<string, string> = { en: 'English', bn: 'Bengali' }

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function translateWithGemini(text: string, from: string, to: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  const fromName = LANGUAGE_NAMES[from]
  const toName = LANGUAGE_NAMES[to]
  if (!key || !fromName || !toName) return null

  // Kept deliberately strict: an LLM asked to "translate" will otherwise
  // sometimes add a preamble, notes, or alternatives, none of which belong
  // in the UI's result box.
  const prompt =
    `Translate the following text from ${fromName} to ${toName}.\n` +
    `Return ONLY the translation itself — no quotes, no explanation, no alternatives, no notes.\n\n` +
    `Text: ${text}`

  let upstream: Response
  try {
    upstream = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': key,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            // Translation should be deterministic, not creative.
            temperature: 0.2,
            // Left on "low" rather than "minimal": measured against real
            // sentences, minimal dropped case marking ("ঢাকা যাব" instead of
            // "ঢাকায় যাব"). This is a language-learning app, so grammatical
            // accuracy is worth the extra tokens.
            thinkingConfig: { thinkingLevel: 'low' },
          },
        }),
      }
    )
  } catch {
    return null
  }
  // A 429 here means the free daily/minute quota is used up — fall through
  // to the next provider rather than failing the request.
  if (!upstream.ok) return null

  const data = await upstream.json()
  // A thinking model can return its reasoning as its own part, so take the
  // first part that actually carries text rather than assuming parts[0].
  const parts: unknown = data?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return null
  const translated = parts
    .map((part) => (part && typeof part === 'object' ? (part as { text?: unknown }).text : undefined))
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)

  return translated ? translated.trim() : null
}

async function translateWithGoogleUnofficial(text: string, from: string, to: string): Promise<string | null> {
  let upstream: Response
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`
    upstream = await fetchWithTimeout(url)
  } catch {
    return null
  }
  if (!upstream.ok) return null

  const data = await upstream.json()
  // The response is a deeply nested array, not an object: data[0] is a list
  // of [translatedChunk, originalChunk, ...] pairs — one per sentence/segment
  // the engine split the input into. Join the translated chunks back into
  // one string.
  const segments = data?.[0]
  if (!Array.isArray(segments) || segments.length === 0) return null

  const translated = segments.map((segment: unknown) => (Array.isArray(segment) ? segment[0] : '') ?? '').join('')
  return translated || null
}

export async function translateText(text: string, from: string, to: string): Promise<TranslateResult> {
  const gemini = await translateWithGemini(text, from, to)
  if (gemini) return { translatedText: gemini }

  const google = await translateWithGoogleUnofficial(text, from, to)
  if (google) return { translatedText: google }

  return { error: 'translation service busy, try again later', status: 503 }
}
