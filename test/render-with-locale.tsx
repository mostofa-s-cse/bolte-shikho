import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { LocaleProvider } from '@/lib/i18n/locale-context'
import { DICTIONARIES } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/locale-routing'

export function renderWithLocale(ui: ReactElement, locale: Locale = 'bn', options?: RenderOptions) {
  return render(
    <LocaleProvider dict={DICTIONARIES[locale]} locale={locale}>
      {ui}
    </LocaleProvider>,
    options
  )
}
