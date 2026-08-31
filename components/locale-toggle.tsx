'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { stripLocale, withLocale, type Locale } from '@/lib/i18n/locale-routing'

export function LocaleToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const other: Locale = locale === 'bn' ? 'en' : 'bn'
  const { rest } = stripLocale(pathname)
  const query = searchParams.toString()
  const href = withLocale(rest, other) + (query ? `?${query}` : '')

  return (
    <Link
      href={href}
      className="cursor-pointer rounded-md px-2 py-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
    >
      {other === 'bn' ? 'বাংলা' : 'English'}
    </Link>
  )
}
