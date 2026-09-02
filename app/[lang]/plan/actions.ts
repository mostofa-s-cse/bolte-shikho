'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { dateFromStartOffset, todayISO } from '@/lib/scoring'

// Identity still comes from Supabase Auth. Data access is Prisma, which
// connects to Postgres directly and does not go through PostgREST — so it
// does not see the `auth.uid() = user_id` RLS policies in supabase/schema.sql.
// Every query below filters by `user_id` explicitly to take over that job.

export async function startPlan() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await prisma.plan_start.upsert({
    where: { user_id: user.id },
    create: { user_id: user.id, start_date: new Date(todayISO()) },
    update: {},
  })
  revalidatePath('/[lang]/plan', 'page')
}

export async function toggleTask(planDay: number, taskIndex: number, completed: boolean, taskCount: number) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await prisma.plan_task_progress.upsert({
    where: { user_id_plan_day_task_index: { user_id: user.id, plan_day: planDay, task_index: taskIndex } },
    create: {
      user_id: user.id,
      plan_day: planDay,
      task_index: taskIndex,
      completed_at: completed ? new Date() : null,
    },
    update: { completed_at: completed ? new Date() : null },
  })

  const doneCount = await prisma.plan_task_progress.count({
    where: { user_id: user.id, plan_day: planDay, completed_at: { not: null } },
  })

  if (doneCount === taskCount) {
    const startRow = await prisma.plan_start.findUnique({ where: { user_id: user.id } })

    if (startRow) {
      const scheduledDate = dateFromStartOffset(startRow.start_date.toISOString().slice(0, 10), planDay - 1)
      const today = todayISO()

      await prisma.plan_day_completion.upsert({
        where: { user_id_plan_day: { user_id: user.id, plan_day: planDay } },
        create: {
          user_id: user.id,
          plan_day: planDay,
          scheduled_date: new Date(scheduledDate),
          completed_date: new Date(today),
        },
        update: {},
      })
    }
  }

  revalidatePath('/[lang]/plan', 'page')
}
