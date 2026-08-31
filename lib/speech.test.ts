import { describe, it, expect, vi, beforeEach } from 'vitest'
import { speak, normalizeSpeech, isSpeechRecognitionSupported } from './speech'

describe('normalizeSpeech', () => {
  it('lowercases, strips punctuation, and collapses whitespace', () => {
    expect(normalizeSpeech("Do you go to school?")).toBe('do you go to school')
    expect(normalizeSpeech("I don't know.")).toBe("i don't know")
    expect(normalizeSpeech('  Hello   World  ')).toBe('hello world')
  })
})

describe('speak', () => {
  beforeEach(() => {
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak: vi.fn() })
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      vi.fn().mockImplementation((text: string) => ({ text, lang: '', rate: 1 }))
    )
  })

  it('strips parenthetical asides and speaker labels before speaking', () => {
    speak('A: I go to school (Present tense).', 1)
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1)
    const utterance = (window.SpeechSynthesisUtterance as any).mock.results[0].value
    expect(utterance.text).toBe('I go to school.')
  })

  it('does nothing when speechSynthesis is unavailable', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    expect(() => speak('hello')).not.toThrow()
  })
})

describe('isSpeechRecognitionSupported', () => {
  it('returns false when neither global is present', () => {
    vi.stubGlobal('SpeechRecognition', undefined)
    vi.stubGlobal('webkitSpeechRecognition', undefined)
    expect(isSpeechRecognitionSupported()).toBe(false)
  })

  it('returns true when webkitSpeechRecognition is present', () => {
    vi.stubGlobal('webkitSpeechRecognition', function () {})
    expect(isSpeechRecognitionSupported()).toBe(true)
  })
})
