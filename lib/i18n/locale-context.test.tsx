import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LocaleProvider, useTranslations } from './locale-context'
import { DICTIONARIES } from './dictionary'

function Probe() {
  const { t, locale } = useTranslations()
  return <span>{locale}:{t.nav.vocab}</span>
}

describe('LocaleProvider / useTranslations', () => {
  it('exposes the dictionary and locale to descendants', () => {
    render(
      <LocaleProvider dict={DICTIONARIES.bn} locale="bn">
        <Probe />
      </LocaleProvider>
    )
    expect(screen.getByText('bn:শব্দ')).toBeInTheDocument()
  })

  it('throws when used outside a LocaleProvider', () => {
    expect(() => render(<Probe />)).toThrow('useTranslations must be used within a LocaleProvider')
  })
})
