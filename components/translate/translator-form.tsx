'use client'

import { useState } from 'react'
import { ArrowLeftRight, Volume2, Mic } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { speak, createRecognition } from '@/lib/speech'
import { useTranslations } from '@/lib/i18n/locale-context'

type Lang = 'en' | 'bn'

export function TranslatorForm() {
  const { t } = useTranslations()
  const LABEL: Record<Lang, string> = { en: t.translate.langEn, bn: t.translate.langBn }
  const [from, setFrom] = useState<Lang>('en')
  const [to, setTo] = useState<Lang>('bn')
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function translate() {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from, to }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? t.translate.genericError)
      setResult(data.translatedText)
    } catch {
      setError(t.translate.error)
    } finally {
      setLoading(false)
    }
  }

  function swap() {
    setFrom(to)
    setTo(from)
    setText(result)
    setResult(text)
  }

  function startMic() {
    const recognition = createRecognition()
    if (!recognition) return
    recognition.lang = from === 'en' ? 'en-US' : 'bn-BD'
    recognition.onresult = (event) => setText(event.results[0][0].transcript)
    recognition.start()
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{LABEL[from]}</span>
        <button
          type="button"
          onClick={swap}
          aria-label={t.translate.swap}
          className="cursor-pointer rounded-md p-1 hover:bg-surface-alt"
        >
          <ArrowLeftRight size={16} />
        </button>
        <span className="font-semibold">{LABEL[to]}</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        maxLength={490}
        placeholder={t.translate.placeholder}
        className="mt-3 w-full rounded-lg border border-border bg-surface p-3 font-bengali text-sm"
      />

      <div className="mt-2 flex gap-2">
        <Button variant="ghost" size="sm" onClick={startMic} type="button" aria-label={t.translate.speakToFill}>
          <Mic size={16} />
        </Button>
        <Button size="sm" onClick={translate} disabled={loading} type="button">
          {loading ? t.translate.translating : t.translate.translateButton}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-bad">{error}</p>}

      {result && (
        <div className="mt-4 rounded-lg border border-border bg-surface-alt p-3">
          <p className="font-bengali text-lg">{result}</p>
          <button
            type="button"
            onClick={() => speak(result, 1, to === 'bn' ? 'bn-BD' : 'en-US')}
            aria-label={t.translate.listen}
            className="mt-2 flex cursor-pointer items-center gap-1 text-sm text-accent"
          >
            <Volume2 size={14} /> {t.translate.listen}
          </button>
        </div>
      )}
    </Card>
  )
}
