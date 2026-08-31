import { PROMPTS } from '@/data/prompts'
import { DIALOGUES } from '@/data/dialogues'
import { PromptCard } from '@/components/practice/prompt-card'
import { PronunciationCheck } from '@/components/practice/pronunciation-check'
import { DialogueList } from '@/components/practice/dialogue-list'
import { PracticeStreak } from '@/components/practice/practice-streak'

export default function PracticePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Practice</h1>
      <PracticeStreak />
      <PromptCard prompts={PROMPTS} />
      <PronunciationCheck />
      <DialogueList dialogues={DIALOGUES} />
    </main>
  )
}
