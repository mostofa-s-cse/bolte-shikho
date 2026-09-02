'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { stripLocale, withLocale, type Locale } from '@/lib/i18n/locale-routing'

export function NavLinks({ links, locale }: { links: { href: string; label: string }[]; locale: Locale }) {
  const pathname = usePathname()
  const { rest } = stripLocale(pathname)

  return (
    <>
      {links.map((link) => {
        const active = rest === link.href || rest.startsWith(`${link.href}/`)
        return (
          <Link key={link.href} href={withLocale(link.href, locale)}>
            <Button type="button" variant="ghost" size="sm" className={active ? 'border-accent text-accent' : ''}>
              {link.label}
            </Button>
          </Link>
        )
      })}
    </>
  )
}
