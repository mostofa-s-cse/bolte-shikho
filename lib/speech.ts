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

export function createRecognition(): SpeechRecognition | null {
  if (typeof window === 'undefined') return null
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SR) return null
  const recognition = new SR() as SpeechRecognition
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  return recognition
}
