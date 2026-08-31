'use client'

import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n/locale-context'

export function CategoryChips({
  categories,
  active,
  onChange,
}: {
  categories: string[]
  active: string
  onChange: (category: string) => void
}) {
  const { t } = useTranslations()
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {[{ key: 'All', label: t.vocab.all }, ...categories.map((c) => ({ key: c, label: c }))].map(
        (category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => onChange(category.key)}
            className={cn(
              'flex-none cursor-pointer whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium',
              active === category.key
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-border bg-surface text-ink-muted'
            )}
          >
            {category.label}
          </button>
        )
      )}
    </div>
  )
}
