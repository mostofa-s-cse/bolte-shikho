export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z' ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
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
