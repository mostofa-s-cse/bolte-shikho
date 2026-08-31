import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileNav } from '@/components/mobile-nav'
import { NAV_LINKS } from '@/lib/nav'

export async function SiteHeader() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" className="font-display text-lg font-semibold">
          Bolte Shikho
        </Link>
        <nav className="hidden flex-wrap gap-4 text-sm font-medium text-ink-muted md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Logout
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button type="button" size="sm">
                Login
              </Button>
            </Link>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
