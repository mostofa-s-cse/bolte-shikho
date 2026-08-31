export const locales = ['bn', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'bn'

export function localeFromPathname(pathname: string): Locale | null {
  const segment = pathname.split('/')[1]
  return (locales as readonly string[]).includes(segment) ? (segment as Locale) : null
}

export function withLocale(pathOrPathAndQuery: string, locale: Locale): string {
  return locale === defaultLocale ? pathOrPathAndQuery : `/${locale}${pathOrPathAndQuery}`
}

export function stripLocale(pathname: string): { locale: Locale; rest: string } {
  const found = localeFromPathname(pathname)
  if (!found) return { locale: defaultLocale, rest: pathname }
  const rest = pathname.slice(`/${found}`.length)
  return { locale: found, rest: rest === '' ? '/' : rest }
}
