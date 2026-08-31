import { TranslatorForm } from '@/components/translate/translator-form'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function TranslatePage() {
  const t = await getDictionary()
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">{t.translate.heading}</h1>
      <p className="mt-1 text-ink-muted">{t.translate.description}</p>
      <div className="mt-6">
        <TranslatorForm />
      </div>
    </main>
  )
}
