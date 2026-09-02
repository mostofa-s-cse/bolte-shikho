// Only this file knows about the translation providers' request/response
// shapes and credentials, so they can be changed later without touching
// the route.
//
// Two REAL machine-translation engines are tried in order — never a
// translation-memory/fuzzy-match service like MyMemory, which can return a
// completely unrelated cached sentence with full confidence. If both real
// engines fail, the caller gets a clear "busy, try again" error instead of
// a wrong-but-confident-looking answer.
//
// 1. Google Translate's unofficial `translate_a/single` endpoint: free, no
//    signup, real dynamic MT. Unofficial — Google can rate-limit/block an
//    IP without notice (this has happened during development).
// 2. Hugging Face Inference API running facebook/nllb-200-distilled-600M:
//    free (just a Hugging Face account + token, no billing/card), real
//    documented API. NLLB-200 uses its own FLORES-200 language codes
//    rather than plain ISO codes, mapped below for the two languages this
//    app supports.
const TIMEOUT_MS = 8000

export type TranslateResult = { translatedText: string } | { error: string; status: number }

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function translateWithGoogle(text: string, from: string, to: string): Promise<string | null> {
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

// NLLB-200's FLORES-200 codes for the two languages this app supports.
const NLLB_LANG: Record<string, string> = { en: 'eng_Latn', bn: 'ben_Beng' }

async function translateWithHuggingFace(text: string, from: string, to: string): Promise<string | null> {
  const token = process.env.HUGGINGFACE_API_TOKEN
  const srcLang = NLLB_LANG[from]
  const tgtLang = NLLB_LANG[to]
  if (!token || !srcLang || !tgtLang) return null

  let upstream: Response
  try {
    upstream = await fetchWithTimeout(
      'https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text, parameters: { src_lang: srcLang, tgt_lang: tgtLang } }),
      }
    )
  } catch {
    return null
  }
  // A cold model answers 503 with {"error": "... is currently loading"} —
  // treated the same as any other failure here (the caller tries the next
  // provider or reports "busy").
  if (!upstream.ok) return null

  const data = await upstream.json()
  const translated = Array.isArray(data) ? data[0]?.translation_text : data?.translation_text
  return translated || null
}

export async function translateText(text: string, from: string, to: string): Promise<TranslateResult> {
  const google = await translateWithGoogle(text, from, to)
  if (google) return { translatedText: google }

  const huggingFace = await translateWithHuggingFace(text, from, to)
  if (huggingFace) return { translatedText: huggingFace }

  return { error: 'translation service busy, try again later', status: 503 }
}
