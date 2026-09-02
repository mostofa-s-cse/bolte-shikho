// Only this file knows about MyMemory's request/response shape, so the
// translation provider can be swapped later without touching the route.
const TIMEOUT_MS = 8000

export type TranslateResult = { translatedText: string } | { error: string; status: number }

export async function translateText(text: string, from: string, to: string): Promise<TranslateResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let upstream: Response
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(`${from}|${to}`)}`
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

  // MyMemory answers HTTP 200 even for quota and error conditions, signalling
  // the real outcome in the body's own `responseStatus` field and stuffing an
  // error message into `translatedText`. Trust the body, not the status line.
  // It sends the code as a number or a string depending on the endpoint, so
  // coerce before comparing (Number(undefined) is NaN, which fails the check).
  if (Number(data?.responseStatus) !== 200) {
    return { error: 'translation service error', status: 502 }
  }

  const translated = data?.responseData?.translatedText
  if (!translated) {
    return { error: 'no translation returned', status: 502 }
  }

  return { translatedText: translated }
}
