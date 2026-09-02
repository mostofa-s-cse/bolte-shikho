'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { stripLocale, withLocale, type Locale } from '@/lib/i18n/locale-routing'

export function NavLinks({ links, locale }: { links: { href: string; label: string }[]; locale: Locale }) {
  const pathname = usePathname()
  const { rest } = stripLocale(pathname)
  const shouldReduceMotion = useReducedMotion()

  return (
    <>
      {links.map((link) => {
        const active = rest === link.href || rest.startsWith(`${link.href}/`)
        return (
          <Link key={link.href} href={withLocale(link.href, locale)} className="relative">
            {active && !shouldReduceMotion && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-full border border-accent"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                'relative',
                active ? 'border-transparent text-accent' : 'hover:text-ink hover:border-border'
              )}
            >
              {link.label}
            </Button>
          </Link>
        )
      })}
    </>
  )
}
