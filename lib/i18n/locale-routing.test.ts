import { describe, it, expect } from 'vitest'
import { localeFromPathname, withLocale, stripLocale } from './locale-routing'

describe('localeFromPathname', () => {
  it('returns null for an unprefixed path', () => {
    expect(localeFromPathname('/vocab')).toBeNull()
    expect(localeFromPathname('/')).toBeNull()
  })
  it('returns the locale for a prefixed path', () => {
    expect(localeFromPathname('/en/vocab')).toBe('en')
    expect(localeFromPathname('/en')).toBe('en')
  })
  it('does not match a non-locale first segment', () => {
    expect(localeFromPathname('/english-lessons')).toBeNull()
  })
})

describe('withLocale', () => {
  it('adds no prefix for the default locale', () => {
    expect(withLocale('/plan', 'bn')).toBe('/plan')
  })
  it('prefixes non-default locales', () => {
    expect(withLocale('/plan', 'en')).toBe('/en/plan')
  })
  it('prefixes before an existing query string', () => {
    expect(withLocale('/login?error=x', 'en')).toBe('/en/login?error=x')
  })
})

describe('stripLocale', () => {
  it('treats an unprefixed path as the default locale', () => {
    expect(stripLocale('/vocab')).toEqual({ locale: 'bn', rest: '/vocab' })
    expect(stripLocale('/')).toEqual({ locale: 'bn', rest: '/' })
  })
  it('strips a locale prefix', () => {
    expect(stripLocale('/en/vocab')).toEqual({ locale: 'en', rest: '/vocab' })
  })
  it('strips a bare locale prefix down to root', () => {
    expect(stripLocale('/en')).toEqual({ locale: 'en', rest: '/' })
  })
})
