import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { startPlan } from '@/app/[lang]/plan/actions'

export function PlanStartCard({ today }: { today: string }) {
  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Shuru Koro</span>
      <p className="mt-2 font-bengali">
        Ei button-e click korle ajker tarikh ({today}) theke Day 1 shuru hobe.
      </p>
      <form action={startPlan}>
        <Button className="mt-4" type="submit">
          Ajke Theke Plan Shuru Koro
        </Button>
      </form>
    </Card>
  )
}
