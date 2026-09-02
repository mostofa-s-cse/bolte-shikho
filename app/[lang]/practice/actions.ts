'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { todayISO } from '@/lib/scoring'

export async function logPracticeToday() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { loggedIn: false as const }

  await prisma.practice_log.upsert({
    where: { user_id_log_date: { user_id: user.id, log_date: new Date(todayISO()) } },
    create: { user_id: user.id, log_date: new Date(todayISO()) },
    update: {},
  })
  revalidatePath('/[lang]/practice', 'page')
  return { loggedIn: true as const }
}
