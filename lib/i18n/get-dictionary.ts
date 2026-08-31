import 'server-only'
import { notFound } from 'next/navigation'
import { lang } from 'next/root-params'
import { DICTIONARIES, type Dictionary } from './dictionary'
import type { Locale } from './locale-routing'
import { locales } from './locale-routing'

export async function getDictionary(): Promise<Dictionary> {
  const locale = await lang()
  if (!(locales as readonly string[]).includes(locale as string)) notFound()
  return DICTIONARIES[locale as Locale]
}
