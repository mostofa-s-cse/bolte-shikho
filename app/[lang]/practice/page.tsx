import { PROMPTS } from '@/data/prompts'
import { DIALOGUES } from '@/data/dialogues'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { computePracticeStreak, todayISO } from '@/lib/scoring'
import { PromptCard } from '@/components/practice/prompt-card'
import { PronunciationCheck } from '@/components/practice/pronunciation-check'
import { DialogueList } from '@/components/practice/dialogue-list'
import { PracticeStreak } from '@/components/practice/practice-streak'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function PracticePage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const t = await getDictionary()

  const today = todayISO()
  let logDates: string[] = []

  if (user) {
    const logRows = await prisma.practice_log.findMany({
      where: { user_id: user.id },
      select: { log_date: true },
      orderBy: { log_date: 'desc' },
      take: 60,
    })
    logDates = logRows.map((row) => row.log_date.toISOString().slice(0, 10))
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">{t.practice.heading}</h1>
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
