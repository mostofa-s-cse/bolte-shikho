import type { Dictionary } from './i18n/dictionary'

// Shared by the (server) SiteHeader and the (client) MobileNav so both
// render the same destinations from a single source of truth.
export function navLinks(t: Dictionary) {
  return [
    { href: '/vocab', label: t.nav.vocab },
    { href: '/grammar', label: t.nav.grammar },
    { href: '/practice', label: t.nav.practice },
    { href: '/plan', label: t.nav.plan },
    { href: '/translate', label: t.nav.translate },
  ]
}
