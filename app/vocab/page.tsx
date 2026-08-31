import { VocabBrowser } from '@/components/vocab/vocab-browser'

export default function VocabPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Shobdo</h1>
      <p className="mt-1 text-ink-muted">Daily-use English word, uccharon o ortho shoho.</p>
      <div className="mt-6">
        <VocabBrowser />
      </div>
    </main>
  )
}
