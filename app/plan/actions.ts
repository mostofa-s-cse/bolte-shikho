'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { dateFromStartOffset } from '@/lib/scoring'

export async function startPlan() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().slice(0, 10)
  await supabase.from('plan_start').upsert({ user_id: user.id, start_date: today })
  revalidatePath('/plan')
}

export async function toggleTask(planDay: number, taskIndex: number, completed: boolean, taskCount: number) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('plan_task_progress').upsert(
    {
      user_id: user.id,
      plan_day: planDay,
      task_index: taskIndex,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,plan_day,task_index' }
  )

  const { count } = await supabase
    .from('plan_task_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('plan_day', planDay)
    .not('completed_at', 'is', null)

  if ((count ?? 0) === taskCount) {
    const { data: startRow } = await supabase
      .from('plan_start')
      .select('start_date')
      .eq('user_id', user.id)
      .single()

    if (startRow) {
      const scheduledDate = dateFromStartOffset(startRow.start_date, planDay - 1)
      const today = new Date().toISOString().slice(0, 10)

      await supabase
        .from('plan_day_completion')
        .upsert(
          { user_id: user.id, plan_day: planDay, scheduled_date: scheduledDate, completed_date: today },
          { onConflict: 'user_id,plan_day', ignoreDuplicates: true }
        )
    }
  }

  revalidatePath('/plan')
}
