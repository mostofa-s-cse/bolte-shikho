'use client'

import { useState, useSyncExternalStore } from 'react'
import { Volume2, Mic, CheckCircle2, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VOCAB } from '@/data/vocab'
import { speak, normalizeSpeech, isSpeechRecognitionSupported, createRecognition } from '@/lib/speech'
import { useTranslations } from '@/lib/i18n/locale-context'

const ALL_WORDS = VOCAB.flatMap((category) => category.words.map((w) => w.en))

export function PronunciationCheck() {
  const { t, format } = useTranslations()
  // Must read false during SSR/hydration (no `window` on the server) and the
  // real capability after — useSyncExternalStore gives us that without a
  // setState-in-effect: React uses getServerSnapshot (false) for SSR and the
  // hydration render, then getSnapshot (the real check) once hydrated.
  const supported = useSyncExternalStore(
    () => () => {},
    () => isSpeechRecognitionSupported(),
    () => false
  )
  const [target, setTarget] = useState(ALL_WORDS[0])
  const [result, setResult] = useState<{ ok: boolean; heard: string } | null>(null)
  const [listening, setListening] = useState(false)

  function nextTarget() {
    setTarget((current) => {
      if (ALL_WORDS.length <= 1) return current
      let next = current
      while (next === current) next = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)]
      return next
    })
    setResult(null)
  }

  function startListening() {
    const recognition = createRecognition()
    if (!recognition) return
    setListening(true)
    recognition.onresult = (event) => {
      const heard = event.results[0][0].transcript
      setResult({ ok: normalizeSpeech(heard) === normalizeSpeech(target), heard })
    }
    recognition.onerror = () => setResult({ ok: false, heard: '' })
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {t.practice.pronunciation.label}
      </span>
      <p className="mt-2 font-bengali text-lg">{target}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="ghost" onClick={() => speak(target)}>
          <Volume2 size={16} /> {t.practice.pronunciation.listen}
        </Button>
        <Button onClick={startListening} disabled={!supported || listening}>
          <Mic size={16} /> {listening ? t.practice.pronunciation.listening : t.practice.pronunciation.micButton}
        </Button>
        <Button variant="ghost" onClick={nextTarget}>
          {t.practice.pronunciation.nextWord}
        </Button>
      </div>
      {!supported && (
        <p className="mt-3 font-bengali text-sm text-ink-muted">{t.practice.pronunciation.unsupported}</p>
      )}
      {result && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
            result.ok ? 'border-good text-good' : 'border-bad text-bad'
          }`}
        >
          {result.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {format(result.ok ? t.practice.pronunciation.correct : t.practice.pronunciation.incorrect, {
            heard: result.heard,
          })}
        </div>
      )}
    </Card>
  )
}
