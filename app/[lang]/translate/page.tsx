import { TranslatorForm } from '@/components/translate/translator-form'

export default function TranslatePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Translator</h1>
      <p className="mt-1 text-ink-muted">English ↔ বাংলা — lekho, ba mic diye bolo.</p>
      <div className="mt-6">
        <TranslatorForm />
      </div>
    </main>
  )
}
