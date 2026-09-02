'use client'

import { useState } from 'react'
import { ArrowLeftRight, Volume2, Mic, Copy, Check, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { speak, createRecognition } from '@/lib/speech'
import { useTranslations } from '@/lib/i18n/locale-context'

type Lang = 'en' | 'bn'
const MAX_LENGTH = 490

export function TranslatorForm() {
  const { t, format } = useTranslations()
  const LABEL: Record<Lang, string> = { en: t.translate.langEn, bn: t.translate.langBn }
  const [from, setFrom] = useState<Lang>('en')
  const [to, setTo] = useState<Lang>('bn')
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

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

  function handleFromChange(value: Lang) {
    setFrom(value)
    if (value === to) setTo(from)
  }

  function handleToChange(value: Lang) {
    setTo(value)
    if (value === from) setFrom(to)
  }

  function clear() {
    setText('')
    setResult('')
    setError('')
  }

  async function copyResult() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be denied (permissions, insecure context) —
      // fail quietly rather than throwing an unhandled rejection.
    }
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
      <div className="flex items-center justify-between gap-2">
        <select
          aria-label={t.translate.sourceLang}
          value={from}
          onChange={(e) => handleFromChange(e.target.value as Lang)}
          className="cursor-pointer rounded-md border border-border bg-surface px-2 py-1 text-sm font-semibold"
        >
          <option value="en">{LABEL.en}</option>
          <option value="bn">{LABEL.bn}</option>
        </select>
        <button
          type="button"
          onClick={swap}
          aria-label={t.translate.swap}
          className="cursor-pointer rounded-md p-1 hover:bg-surface-alt"
        >
          <ArrowLeftRight size={16} />
        </button>
        <select
          aria-label={t.translate.targetLang}
          value={to}
          onChange={(e) => handleToChange(e.target.value as Lang)}
          className="cursor-pointer rounded-md border border-border bg-surface px-2 py-1 text-sm font-semibold"
        >
          <option value="en">{LABEL.en}</option>
          <option value="bn">{LABEL.bn}</option>
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
        rows={4}
        maxLength={MAX_LENGTH}
        placeholder={t.translate.placeholder}
        className="mt-3 w-full rounded-lg border border-border bg-surface p-3 font-bengali text-sm"
      />
      <div className="mt-1 text-right text-xs text-ink-muted">
        {format(t.translate.charCount, { count: text.length, max: MAX_LENGTH })}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={startMic} type="button" aria-label={t.translate.speakToFill}>
          <Mic size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={clear} type="button" disabled={!text && !result}>
          <X size={16} /> {t.translate.clear}
        </Button>
        <Button size="sm" onClick={translate} disabled={loading || !text.trim()} type="button">
          {loading ? t.translate.translating : t.translate.translateButton}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-bad">{error}</p>}

      {result && (
        <div className="mt-4 rounded-lg border border-border bg-surface-alt p-3">
          <p className="font-bengali text-lg">{result}</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => speak(result, 1, to === 'bn' ? 'bn-BD' : 'en-US')}
              aria-label={t.translate.listen}
              className="flex cursor-pointer items-center gap-1 text-sm text-accent"
            >
              <Volume2 size={14} /> {t.translate.listen}
            </button>
            <button
              type="button"
              onClick={copyResult}
              aria-label={t.translate.copy}
              className="flex cursor-pointer items-center gap-1 text-sm text-accent"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t.translate.copied : t.translate.copy}
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
