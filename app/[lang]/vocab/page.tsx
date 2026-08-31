import { VocabBrowser } from '@/components/vocab/vocab-browser'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function VocabPage() {
  const t = await getDictionary()
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">{t.vocab.heading}</h1>
      <p className="mt-1 text-ink-muted">{t.vocab.description}</p>
      <div className="mt-6">
        <VocabBrowser />
      </div>
    </main>
  )
}
