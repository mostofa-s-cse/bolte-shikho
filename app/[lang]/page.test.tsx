import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LocaleProvider } from '@/lib/i18n/locale-context'
import { DICTIONARIES } from '@/lib/i18n/dictionary'
import LandingPage from './page'

describe('LandingPage', () => {
  it('renders the heading, subtext, and CTA', () => {
    render(
      <LocaleProvider dict={DICTIONARIES.bn} locale="bn">
        <LandingPage />
      </LocaleProvider>
    )
    expect(screen.getByRole('heading', { name: DICTIONARIES.bn.home.heading })).toBeInTheDocument()
    expect(screen.getByText(DICTIONARIES.bn.home.sub)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: DICTIONARIES.bn.home.cta })).toBeInTheDocument()
  })

  it('renders the mascot and the first hero bubble phrase', () => {
    render(
      <LocaleProvider dict={DICTIONARIES.bn} locale="bn">
        <LandingPage />
      </LocaleProvider>
    )
    expect(screen.getByTestId('parrot-mascot')).toBeInTheDocument()
    expect(screen.getByText(DICTIONARIES.bn.home.heroBubble[0])).toBeInTheDocument()
  })

  it('renders every feature card', () => {
    render(
      <LocaleProvider dict={DICTIONARIES.bn} locale="bn">
        <LandingPage />
      </LocaleProvider>
    )
    for (const feature of Object.values(DICTIONARIES.bn.home.features)) {
      expect(screen.getByRole('heading', { name: feature.title })).toBeInTheDocument()
    }
  })
})
