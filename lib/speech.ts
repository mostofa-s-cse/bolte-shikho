export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z' ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function speak(text: string, rate = 1): void {
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
  utterance.lang = 'en-US'
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
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

export function createRecognition(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SR) return null
  const recognition = new SR() as SpeechRecognitionLike
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  return recognition
}
