'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { navLinks } from '@/lib/nav'
import { useTranslations } from '@/lib/i18n/locale-context'
import { withLocale } from '@/lib/i18n/locale-routing'
import { Button } from '@/components/ui/button'

// SiteHeader is an async Server Component and cannot hold state, so the
// mobile disclosure lives here as its own client island.
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { t, locale } = useTranslations()
  const links = navLinks(t)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t.header.closeMenu : t.header.openMenu}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="cursor-pointer rounded-md p-2 text-ink-muted hover:bg-surface-alt hover:text-ink"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <nav
          id="mobile-nav-panel"
          className="absolute left-0 right-0 top-full flex flex-col gap-1 border-b border-border bg-surface px-6 py-3 shadow-sm"
        >
          {links.map((link) => (
            <Link key={link.href} href={withLocale(link.href, locale)} onClick={() => setOpen(false)}>
              <Button type="button" variant="ghost" size="sm" className="w-full justify-start">
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
