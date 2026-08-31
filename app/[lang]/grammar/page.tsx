import { GRAMMAR_STEPS } from '@/data/grammar'
import { GrammarSteps } from '@/components/grammar/grammar-steps'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function GrammarPage() {
  const t = await getDictionary()
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">{t.grammar.heading}</h1>
      <p className="mt-1 text-ink-muted">{t.grammar.description}</p>
      <div className="mt-6">
        <GrammarSteps steps={GRAMMAR_STEPS} />
      </div>
    </main>
  )
}
