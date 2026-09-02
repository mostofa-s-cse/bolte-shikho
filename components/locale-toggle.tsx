'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { stripLocale, withLocale, type Locale } from '@/lib/i18n/locale-routing'

export function LocaleToggle({ locale }: { locale: Locale }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { rest } = stripLocale(pathname)
  const query = searchParams.toString()

  function hrefFor(target: Locale) {
    return withLocale(rest, target) + (query ? `?${query}` : '')
  }

  return (
    <select
      value={locale}
      onChange={(e) => router.push(hrefFor(e.target.value as Locale))}
      aria-label="Language"
      className="cursor-pointer rounded-md border border-border bg-surface px-2 py-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
    >
      <option value="bn">বাংলা</option>
      <option value="en">English</option>
    </select>
  )
}
