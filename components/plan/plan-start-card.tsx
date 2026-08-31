'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { startPlan } from '@/app/[lang]/plan/actions'
import { useTranslations } from '@/lib/i18n/locale-context'

export function PlanStartCard({ today }: { today: string }) {
  const { t, format } = useTranslations()
  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {t.plan.startLabel}
      </span>
      <p className="mt-2 font-bengali">{format(t.plan.startBody, { today })}</p>
      <form action={startPlan}>
        <Button className="mt-4" type="submit">
          {t.plan.startButton}
        </Button>
      </form>
    </Card>
  )
}
