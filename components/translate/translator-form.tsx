'use client'

import { useState } from 'react'
import { ArrowLeftRight, Volume2, Mic } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { speak, createRecognition } from '@/lib/speech'

type Lang = 'en' | 'bn'

const LABEL: Record<Lang, string> = { en: 'English', bn: 'বাংলা' }

export function TranslatorForm() {
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
      if (!res.ok) throw new Error(data.error ?? 'Translation failed')
      setResult(data.translatedText)
    } catch {
      setError('Translate korte parlam na. Abar try koro.')
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
        <button type="button" onClick={swap} aria-label="Swap languages" className="rounded-md p-1 hover:bg-surface-alt">
          <ArrowLeftRight size={16} />
        </button>
        <span className="font-semibold">{LABEL[to]}</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        // Mirrors MAX_TEXT_LENGTH in /api/translate so the cap is visible in
        // the UI instead of surfacing as a generic error.
        maxLength={490}
        placeholder="Lekho..."
        className="mt-3 w-full rounded-lg border border-border bg-surface p-3 font-bengali text-sm"
      />

      <div className="mt-2 flex gap-2">
        <Button variant="ghost" size="sm" onClick={startMic} type="button" aria-label="Speak to fill the text">
          <Mic size={16} />
        </Button>
        <Button size="sm" onClick={translate} disabled={loading} type="button">
          {loading ? 'Translate hocche...' : 'Translate Koro'}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-bad">{error}</p>}

      {result && (
        <div className="mt-4 rounded-lg border border-border bg-surface-alt p-3">
          <p className="font-bengali text-lg">{result}</p>
          <button
            type="button"
            onClick={() => speak(result, 1, to === 'bn' ? 'bn-BD' : 'en-US')}
            aria-label="Listen"
            className="mt-2 flex items-center gap-1 text-sm text-accent"
          >
            <Volume2 size={14} /> Shuno
          </button>
        </div>
      )}
    </Card>
  )
}
