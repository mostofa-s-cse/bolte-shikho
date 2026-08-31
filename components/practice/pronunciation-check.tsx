'use client'

import { useMemo, useState } from 'react'
import { Volume2, Mic, CheckCircle2, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VOCAB } from '@/data/vocab'
import { speak, normalizeSpeech, isSpeechRecognitionSupported, createRecognition } from '@/lib/speech'

const ALL_WORDS = VOCAB.flatMap((category) => category.words.map((w) => w.en))

export function PronunciationCheck() {
  const supported = useMemo(() => isSpeechRecognitionSupported(), [])
  // Starts deterministically at the first word: Math.random() in the
  // initializer produced a different value on the server than at hydration,
  // which mismatched and made the visible word swap right after load.
  // "Notun Word" is how you get a different one.
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
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Bolar jonno</span>
      <p className="mt-2 font-bengali text-lg">{target}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="ghost" onClick={() => speak(target)}>
          <Volume2 size={16} /> Shuno
        </Button>
        <Button onClick={startListening} disabled={!supported || listening}>
          <Mic size={16} /> {listening ? 'Shunchi...' : 'Bolo'}
        </Button>
        <Button variant="ghost" onClick={nextTarget}>
          Notun Word
        </Button>
      </div>
      {!supported && (
        <p className="mt-3 font-bengali text-sm text-ink-muted">
          Ei browser-e mic check kaj korbe na. Chrome (Android/Desktop) e best kaj kore.
        </p>
      )}
      {result && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
            result.ok ? 'border-good text-good' : 'border-bad text-bad'
          }`}
        >
          {result.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {result.ok ? `Thik ache! Tumi bolecho: "${result.heard}"` : `Tumi bolecho: "${result.heard}"`}
        </div>
      )}
    </Card>
  )
}
