'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function logPracticeToday() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { loggedIn: false as const }

  const today = new Date().toISOString().slice(0, 10)
  await supabase.from('practice_log').upsert({ user_id: user.id, log_date: today })
  return { loggedIn: true as const }
}
