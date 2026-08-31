'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { todayISO } from '@/lib/scoring'

export async function logPracticeToday() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { loggedIn: false as const }

  await supabase.from('practice_log').upsert({ user_id: user.id, log_date: todayISO() })
  revalidatePath('/[lang]/practice', 'page')
  return { loggedIn: true as const }
}
