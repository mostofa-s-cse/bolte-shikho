import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { speak, normalizeSpeech, isSpeechRecognitionSupported } from './speech'

interface StubUtterance {
  text: string
  lang: string
  rate: number
  voice: SpeechSynthesisVoice | null
}

function stubVoice(name: string, lang: string): SpeechSynthesisVoice {
  return { name, lang } as SpeechSynthesisVoice
}

// The stub installed in beforeEach; typed here so the assertions can read
// back the utterance it constructed without an `any` cast.
function lastUtterance(): StubUtterance {
  const constructor = window.SpeechSynthesisUtterance as unknown as Mock<
    (text: string) => void
  >
  return constructor.mock.results[0].value as StubUtterance
}

describe('normalizeSpeech', () => {
  it('lowercases, strips punctuation, and collapses whitespace', () => {
    expect(normalizeSpeech("Do you go to school?")).toBe('do you go to school')
    expect(normalizeSpeech("I don't know.")).toBe("i don't know")
    expect(normalizeSpeech('  Hello   World  ')).toBe('hello world')
  })
})

describe('speak', () => {
  beforeEach(() => {
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak: vi.fn(), getVoices: vi.fn(() => []) })
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      // Must be a real `function`, not an arrow function — arrow functions
      // are never constructible, and `speak()` calls this with `new`.
      vi.fn(function (this: StubUtterance, text: string) {
        this.text = text
        this.lang = ''
        this.rate = 1
        this.voice = null
      })
    )
  })

  it('strips parenthetical asides and speaker labels before speaking', () => {
    speak('A: I go to school (Present tense).', 1)
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1)
    expect(lastUtterance().text).toBe('I go to school.')
  })

  it('defaults to an English voice', () => {
    speak('hello')
    expect(lastUtterance().lang).toBe('en-US')
  })

  it('uses the language it is given', () => {
    speak('হ্যালো', 1, 'bn-BD')
    expect(lastUtterance().lang).toBe('bn-BD')
  })

  it('does nothing when speechSynthesis is unavailable', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    expect(() => speak('hello')).not.toThrow()
  })

  it('picks a clearer-sounding voice over a plain one when both match the language', () => {
    const plain = stubVoice('Microsoft David', 'en-US')
    const clearer = stubVoice('Google US English', 'en-US')
    window.speechSynthesis.getVoices = vi.fn(() => [plain, clearer])

    speak('hello')

    expect(lastUtterance().voice).toBe(clearer)
  })

  it('falls back to any matching-language voice when no clearer one is available', () => {
    const onlyVoice = stubVoice('Microsoft David', 'en-US')
    window.speechSynthesis.getVoices = vi.fn(() => [onlyVoice])

    speak('hello')

    expect(lastUtterance().voice).toBe(onlyVoice)
  })

  it('leaves the browser default voice when no voices are available yet', () => {
    speak('hello')
    expect(lastUtterance().voice).toBeNull()
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
