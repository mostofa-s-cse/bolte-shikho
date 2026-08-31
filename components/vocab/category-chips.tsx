'use client'

import { cn } from '@/lib/utils'

export function CategoryChips({
  categories,
  active,
  onChange,
}: {
  categories: string[]
  active: string
  onChange: (category: string) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {['All', ...categories].map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={cn(
            'flex-none cursor-pointer whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium',
            active === category
              ? 'border-accent bg-accent text-accent-ink'
              : 'border-border bg-surface text-ink-muted'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
