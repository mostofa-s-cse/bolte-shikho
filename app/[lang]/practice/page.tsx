import { PROMPTS } from '@/data/prompts'
import { DIALOGUES } from '@/data/dialogues'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { computePracticeStreak, todayISO } from '@/lib/scoring'
import { PromptCard } from '@/components/practice/prompt-card'
import { PronunciationCheck } from '@/components/practice/pronunciation-check'
import { DialogueList } from '@/components/practice/dialogue-list'
import { PracticeStreak } from '@/components/practice/practice-streak'

export default async function PracticePage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const today = todayISO()
  let logDates: string[] = []

  if (user) {
    const { data: logRows } = await supabase
      .from('practice_log')
      .select('log_date')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(60)
    logDates = (logRows ?? []).map((row) => row.log_date as string)
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Practice</h1>
      <PracticeStreak
        initialStreak={computePracticeStreak(logDates, today)}
        initialDoneToday={logDates.includes(today)}
      />
      <PromptCard prompts={PROMPTS} />
      <PronunciationCheck />
      <DialogueList dialogues={DIALOGUES} />
    </main>
  )
}
