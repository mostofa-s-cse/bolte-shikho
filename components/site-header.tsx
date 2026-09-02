import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileNav } from '@/components/mobile-nav'
import { LocaleToggle } from '@/components/locale-toggle'
import { NavLinks } from '@/components/nav-links'
import { navLinks } from '@/lib/nav'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'
import { lang } from 'next/root-params'

export async function SiteHeader() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const t = await getDictionary()
  const locale = (await lang()) === 'en' ? 'en' : 'bn'
  const links = navLinks(t)

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href={withLocale('/', locale)} className="font-display text-lg font-semibold">
          {t.header.brand}
        </Link>
        <nav className="hidden flex-wrap gap-2 md:flex">
          <NavLinks links={links} locale={locale} />
        </nav>
        <div className="flex items-center gap-2">
          <LocaleToggle locale={locale} />
          <ThemeToggle />
          {user ? (
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                {t.header.logout}
              </Button>
            </form>
          ) : (
            <Link href={withLocale('/login', locale)}>
              <Button type="button" size="sm">
                {t.header.login}
              </Button>
            </Link>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
