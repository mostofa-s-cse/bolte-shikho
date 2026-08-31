import { cookies } from 'next/headers'
import { defaultLocale, type Locale } from './locale-routing'

// Server Actions and Route Handlers can't use next/root-params (App Router
// restriction), so they read the NEXT_LOCALE cookie proxy.ts sets instead.
export async function currentLocale(): Promise<Locale> {
  const store = await cookies()
  const value = store.get('NEXT_LOCALE')?.value
  return value === 'en' ? 'en' : defaultLocale
}
