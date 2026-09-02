export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z' ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// The browser lists several voices per language, and the one it defaults
// to is often a low-quality/robotic one. Prefer a voice whose name signals
// higher quality (Google's and the OS's "Natural"/"Enhanced"/"Premium"
// voices are markedly clearer than the fallback ones), falling back to any
// voice that matches the language, then to the browser's own default.
function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis?.getVoices) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const langPrefix = lang.split('-')[0]
  const matching = voices.filter((v) => v.lang === lang || v.lang.startsWith(langPrefix))
  if (!matching.length) return null

  const clearerNamePattern = /google|natural|enhanced|premium|neural/i
  return matching.find((v) => clearerNamePattern.test(v.name)) ?? matching[0]
}

// `lang` picks the voice. It defaults to English because most callers read
// back English vocabulary; the translator passes 'bn-BD' when the result it
// is speaking is Bangla.
export function speak(text: string, rate = 1, lang = 'en-US'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) {
    return
  }
  window.speechSynthesis.cancel()
  const clean = text
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/^[AB]:\s*/, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.!?,;:])/g, '$1')
    .trim()
  const utterance = new SpeechSynthesisUtterance(clean)
  utterance.lang = lang
  utterance.rate = rate
  const voice = pickVoice(lang)
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}

// The Web Speech API's SpeechRecognition interface isn't part of
// TypeScript's standard DOM lib (it never shipped as a finished web
// standard), so `next build`'s type-check has no built-in type for it.
// This is a minimal shape covering only what this app actually uses.
export interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}

export interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
}

// Neither constructor is declared on `Window` in TypeScript's DOM lib, so
// this is the minimal ambient shape needed to reach them without `any`.
export interface WindowWithSpeechRecognition {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

function speechRecognitionWindow(): WindowWithSpeechRecognition {
  return window as unknown as WindowWithSpeechRecognition
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  const w = speechRecognitionWindow()
  return !!w.SpeechRecognition || !!w.webkitSpeechRecognition
}

export function createRecognition(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null
  const w = speechRecognitionWindow()
  const SR = w.SpeechRecognition || w.webkitSpeechRecognition
  if (!SR) return null
  const recognition = new SR()
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  return recognition
}
