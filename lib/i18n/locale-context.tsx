'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Dictionary } from './dictionary'
import type { Locale } from './locale-routing'
import { format } from './format'

const LocaleContext = createContext<{ dict: Dictionary; locale: Locale } | null>(null)

export function LocaleProvider({
  dict,
  locale,
  children,
}: {
  dict: Dictionary
  locale: Locale
  children: ReactNode
}) {
  return <LocaleContext.Provider value={{ dict, locale }}>{children}</LocaleContext.Provider>
}

export function useTranslations() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useTranslations must be used within a LocaleProvider')
  return { t: ctx.dict, locale: ctx.locale, format }
}
