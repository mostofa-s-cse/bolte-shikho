import { GRAMMAR_STEPS } from '@/data/grammar'
import { GrammarSteps } from '@/components/grammar/grammar-steps'

export default function GrammarPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Bakko o Tense</h1>
      <p className="mt-1 text-ink-muted">Tense theke comparative porjonto, step by step.</p>
      <div className="mt-6">
        <GrammarSteps steps={GRAMMAR_STEPS} />
      </div>
    </main>
  )
}
