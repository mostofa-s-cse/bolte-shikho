# Bilingual UI (Bangla/English switch) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the app's hardcoded English/Banglish UI copy with a real Bangla (default, unprefixed URL) / English (`/en` prefix) switch, using this Next.js build's native `[lang]` segment + dictionary pattern.

**Architecture:** All pages move under `app/[lang]/...`. `proxy.ts` rewrites unprefixed paths to `/bn/...` internally and tags the response with a `NEXT_LOCALE` cookie. Server Components read the dictionary via `next/root-params`; Client Components read it from a `LocaleProvider` React Context seeded once in the root layout; Server Actions/Route Handlers (where `next/root-params` doesn't work) read the `NEXT_LOCALE` cookie directly.

**Tech Stack:** Next.js 16.3.3 App Router (native i18n pattern, no third-party library), TypeScript, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-31-bilingual-ui-design.md`

## Global Constraints

- `data/*.ts` content (vocab words, grammar steps, dialogues, plan tasks, prompts) is never touched — out of scope per spec.
- `bn` is the default locale (no URL prefix); `en` is prefixed (`/en/...`).
- No third-party i18n library.
- Every existing test must still pass; `npm run build` must succeed generating both locale route trees; `npm run lint` must stay clean.
- Real Bangla script for `bn`, proper English for `en` — not Banglish.

---

### Task 1: Locale routing primitives

**Files:**
- Create: `lib/i18n/locale-routing.ts`
- Test: `lib/i18n/locale-routing.test.ts`

**Interfaces:**
- Produces: `locales: readonly ['bn', 'en']`, `type Locale = 'bn' | 'en'`, `defaultLocale: Locale = 'bn'`, `localeFromPathname(pathname: string): Locale | null`, `withLocale(pathOrPathAndQuery: string, locale: Locale): string`, `stripLocale(pathname: string): { locale: Locale; rest: string }`.

- [ ] **Step 1: Write the failing test**

```ts
// lib/i18n/locale-routing.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/i18n/locale-routing.test.ts`
Expected: FAIL — `Cannot find module './locale-routing'`

- [ ] **Step 3: Write the implementation**

```ts
// lib/i18n/locale-routing.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/i18n/locale-routing.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/i18n/locale-routing.ts lib/i18n/locale-routing.test.ts
git commit -m "feat(i18n): add pure locale-routing helpers"
```

---

### Task 2: Dictionary content and type

**Files:**
- Create: `dictionaries/bn.json`
- Create: `dictionaries/en.json`
- Create: `lib/i18n/dictionary.ts`
- Create: `lib/i18n/format.ts`
- Test: `lib/i18n/format.test.ts`
- Test: `lib/i18n/dictionary.test.ts`

**Interfaces:**
- Produces: `type Dictionary` (shape of `dictionaries/bn.json`), `DICTIONARIES: Record<Locale, Dictionary>`, `format(template: string, vars?: Record<string, string | number>): string`.
- Consumes: `Locale` from Task 1.

- [ ] **Step 1: Write the failing test for `format`**

```ts
// lib/i18n/format.test.ts
import { describe, it, expect } from 'vitest'
import { format } from './format'

describe('format', () => {
  it('returns the template unchanged with no vars', () => {
    expect(format('Notun Word')).toBe('Notun Word')
  })
  it('substitutes a single placeholder', () => {
    expect(format('{{total}} words', { total: 307 })).toBe('307 words')
  })
  it('substitutes multiple placeholders', () => {
    expect(format('{{shown}} / {{total}} words', { shown: 5, total: 307 })).toBe('5 / 307 words')
  })
  it('substitutes a string value', () => {
    expect(format('You said: "{{heard}}"', { heard: 'hello' })).toBe('You said: "hello"')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/i18n/format.test.ts`
Expected: FAIL — `Cannot find module './format'`

- [ ] **Step 3: Implement `format`**

```ts
// lib/i18n/format.ts
export function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ''))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/i18n/format.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Write `dictionaries/bn.json`**

```json
{
  "nav": {
    "vocab": "শব্দ",
    "grammar": "বাক্য ও টেন্স",
    "practice": "অনুশীলন",
    "plan": "৩০ দিনের পরিকল্পনা",
    "translate": "অনুবাদ"
  },
  "header": {
    "brand": "বলতে শিখো",
    "login": "লগইন",
    "logout": "লগআউট",
    "openMenu": "মেনু খোলো",
    "closeMenu": "মেনু বন্ধ করো",
    "toggleTheme": "থিম পরিবর্তন করো"
  },
  "home": {
    "heading": "বাংলা থেকে ইংরেজিতে — বলতে শেখো, এখন থেকে।",
    "sub": "শব্দ, ব্যাকরণ, উচ্চারণ অনুশীলন, আর একটা ৩০ দিনের পরিকল্পনা — সব একজায়গায়।",
    "cta": "আজকে শুরু করো",
    "features": {
      "vocab": { "title": "শব্দ", "body": "২৫০+ প্রতিদিনের ব্যবহারের শব্দ, অডিও উচ্চারণসহ, কুইজ মোড।" },
      "grammar": { "title": "বাক্য ও টেন্স", "body": "১৫ ধাপে ইংরেজি ব্যাকরণ — টেন্স থেকে তুলনা পর্যন্ত।" },
      "practice": { "title": "অনুশীলন", "body": "মাইক দিয়ে উচ্চারণ চেক, কথোপকথন, প্রতিদিনের টপিক।" },
      "plan": { "title": "৩০ দিনের পরিকল্পনা", "body": "প্রতিদিনের লক্ষ্য, স্কোর সিস্টেম, সময়মতো/দেরিতে ক্যালেন্ডার ট্র্যাকিং।" },
      "translate": { "title": "অনুবাদক", "body": "ইংরেজি ↔ বাংলা, মাইক দিয়ে বলো, শুনে নাও।" }
    }
  },
  "vocab": {
    "heading": "শব্দ",
    "description": "প্রতিদিনের ব্যবহারের ইংরেজি শব্দ, উচ্চারণ ও অর্থসহ।",
    "searchPlaceholder": "শব্দ খোঁজো... (ইংরেজি, উচ্চারণ, বা অর্থ লিখে)",
    "all": "সব",
    "normalSpeed": "স্বাভাবিক গতি",
    "slowSpeed": "ধীর গতি",
    "quizMode": "কুইজ মোড",
    "listen": "শোনো",
    "tapToReveal": "দেখতে ট্যাপ করো",
    "wordCountAll": "{{total}}টা শব্দ",
    "wordCountFiltered": "{{shown}} / {{total}} শব্দ"
  },
  "grammar": {
    "heading": "বাক্য ও টেন্স",
    "description": "টেন্স থেকে তুলনা পর্যন্ত, ধাপে ধাপে।",
    "listen": "শোনো"
  },
  "practice": {
    "heading": "অনুশীলন",
    "streak": {
      "label": "অনুশীলনের ধারা",
      "days": "{{n}} দিন",
      "encourageActive": "রোজ কথা বলা ছাড়া উপায় নেই।",
      "encourageStart": "আজ থেকে শুরু করো — রোজ একবার।",
      "doneButton": "আজকের অনুশীলন হয়ে গেছে",
      "actionButton": "আজকে অনুশীলন করলাম",
      "guestNotice": "ধারা সেভ করতে হলে লগইন করো।"
    },
    "prompt": { "label": "আজকের টপিক", "next": "নতুন টপিক" },
    "pronunciation": {
      "label": "বলার জন্য",
      "listen": "শোনো",
      "micButton": "বলো",
      "listening": "শুনছি...",
      "nextWord": "নতুন শব্দ",
      "unsupported": "এই ব্রাউজারে মাইক চেক কাজ করবে না। Chrome (Android/Desktop)-এ সবচেয়ে ভালো কাজ করে।",
      "correct": "ঠিক আছে! তুমি বলেছো: \"{{heard}}\"",
      "incorrect": "তুমি বলেছো: \"{{heard}}\""
    },
    "dialogue": { "listen": "শোনো" }
  },
  "plan": {
    "headingGuest": "৩০ দিনের পরিকল্পনা",
    "loginPrompt": "পরিকল্পনা দেখতে/শুরু করতে লগইন করো।",
    "headingScore": "৩০ দিনের পরিকল্পনা ও স্কোর",
    "day": "দিন {{day}}",
    "startLabel": "শুরু করো",
    "startBody": "এই বাটনে ক্লিক করলে আজকের তারিখ ({{today}}) থেকে দিন ১ শুরু হবে।",
    "startButton": "আজ থেকে পরিকল্পনা শুরু করো",
    "score": "স্কোর",
    "dayOfTotal": "আজকের দিন / মোট",
    "onTime": "সময়মতো শেষ"
  },
  "translate": {
    "heading": "অনুবাদক",
    "description": "ইংরেজি ↔ বাংলা — লেখো, বা মাইক দিয়ে বলো।",
    "langEn": "English",
    "langBn": "বাংলা",
    "placeholder": "লেখো...",
    "swap": "ভাষা বদলাও",
    "speakToFill": "বলে লেখো",
    "translating": "অনুবাদ হচ্ছে...",
    "translateButton": "অনুবাদ করো",
    "listen": "শোনো",
    "genericError": "অনুবাদ ব্যর্থ হয়েছে",
    "error": "অনুবাদ করতে পারলাম না। আবার চেষ্টা করো।"
  },
  "login": {
    "heading": "লগইন করো",
    "email": "ইমেইল",
    "password": "পাসওয়ার্ড",
    "button": "লগইন করো",
    "noAccount": "অ্যাকাউন্ট নেই? ",
    "signupLink": "অ্যাকাউন্ট খোলো"
  },
  "signup": {
    "heading": "অ্যাকাউন্ট খোলো",
    "name": "নাম",
    "email": "ইমেইল",
    "password": "পাসওয়ার্ড",
    "button": "অ্যাকাউন্ট খোলো",
    "haveAccount": "আগে থেকে অ্যাকাউন্ট আছে? ",
    "loginLink": "লগইন করো"
  },
  "checkEmail": {
    "heading": "ইমেইল চেক করো",
    "body": "আমরা একটা নিশ্চিতকরণ লিংক পাঠিয়েছি। ওটায় ক্লিক করলে অ্যাকাউন্ট সক্রিয় হবে — তারপর লগইন করো।",
    "done": "লিংকে ক্লিক করা হয়ে গেছে? ",
    "loginLink": "লগইন করো"
  },
  "validation": {
    "emailRequired": "ইমেইল দাও।",
    "emailInvalid": "সঠিক ইমেইল দাও।",
    "passwordTooShort": "পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে।",
    "nameRequired": "নাম দাও।"
  }
}
```

- [ ] **Step 6: Write `dictionaries/en.json`** (same key shape, English strings)

```json
{
  "nav": {
    "vocab": "Vocab",
    "grammar": "Grammar & Tense",
    "practice": "Practice",
    "plan": "30-Day Plan",
    "translate": "Translate"
  },
  "header": {
    "brand": "Bolte Shikho",
    "login": "Login",
    "logout": "Logout",
    "openMenu": "Open menu",
    "closeMenu": "Close menu",
    "toggleTheme": "Toggle theme"
  },
  "home": {
    "heading": "From Bangla to English — learn to speak, starting now.",
    "sub": "Vocabulary, grammar, pronunciation practice, and a 30-day plan — all in one place.",
    "cta": "Start Today",
    "features": {
      "vocab": { "title": "Vocab", "body": "250+ daily-use words, with audio pronunciation, quiz mode." },
      "grammar": { "title": "Grammar & Tense", "body": "English grammar in 15 steps — from tenses to comparatives." },
      "practice": { "title": "Practice", "body": "Check pronunciation with your mic, conversation dialogues, a daily topic." },
      "plan": { "title": "30-Day Plan", "body": "Daily targets, a scoring system, on-time/late calendar tracking." },
      "translate": { "title": "Translator", "body": "English ↔ Bangla, speak into the mic, listen back." }
    }
  },
  "vocab": {
    "heading": "Vocab",
    "description": "Daily-use English words, with pronunciation and meaning.",
    "searchPlaceholder": "Search a word... (English, pronunciation, or meaning)",
    "all": "All",
    "normalSpeed": "Normal speed",
    "slowSpeed": "Slow speed",
    "quizMode": "Quiz mode",
    "listen": "Listen",
    "tapToReveal": "Tap to reveal",
    "wordCountAll": "{{total}} words",
    "wordCountFiltered": "{{shown}} / {{total}} words"
  },
  "grammar": {
    "heading": "Grammar & Tense",
    "description": "From tenses to comparatives, step by step.",
    "listen": "Listen"
  },
  "practice": {
    "heading": "Practice",
    "streak": {
      "label": "Practice Streak",
      "days": "{{n}} days",
      "encourageActive": "No way around it — talk every day.",
      "encourageStart": "Start today — once a day.",
      "doneButton": "Practice done for today",
      "actionButton": "I Practiced Today",
      "guestNotice": "Login to save your streak."
    },
    "prompt": { "label": "Today's Topic", "next": "New Topic" },
    "pronunciation": {
      "label": "Say this",
      "listen": "Listen",
      "micButton": "Speak",
      "listening": "Listening...",
      "nextWord": "New Word",
      "unsupported": "Mic check won't work in this browser. Works best on Chrome (Android/Desktop).",
      "correct": "That's right! You said: \"{{heard}}\"",
      "incorrect": "You said: \"{{heard}}\""
    },
    "dialogue": { "listen": "Listen" }
  },
  "plan": {
    "headingGuest": "30-Day Plan",
    "loginPrompt": "Login to view/start the plan.",
    "headingScore": "30-Day Plan & Score",
    "day": "Day {{day}}",
    "startLabel": "Get Started",
    "startBody": "Clicking this button starts Day 1 from today's date ({{today}}).",
    "startButton": "Start the Plan from Today",
    "score": "Score",
    "dayOfTotal": "Day / Total",
    "onTime": "Done on time"
  },
  "translate": {
    "heading": "Translator",
    "description": "English ↔ Bangla — type, or speak into the mic.",
    "langEn": "English",
    "langBn": "বাংলা",
    "placeholder": "Type...",
    "swap": "Swap languages",
    "speakToFill": "Speak to fill the text",
    "translating": "Translating...",
    "translateButton": "Translate",
    "listen": "Listen",
    "genericError": "Translation failed",
    "error": "Couldn't translate. Try again."
  },
  "login": {
    "heading": "Login",
    "email": "Email",
    "password": "Password",
    "button": "Login",
    "noAccount": "No account? ",
    "signupLink": "Sign up"
  },
  "signup": {
    "heading": "Create Account",
    "name": "Name",
    "email": "Email",
    "password": "Password",
    "button": "Create Account",
    "haveAccount": "Already have an account? ",
    "loginLink": "Login"
  },
  "checkEmail": {
    "heading": "Check Your Email",
    "body": "We sent a confirmation link. Click it to activate your account — then login.",
    "done": "Already clicked the link? ",
    "loginLink": "Login"
  },
  "validation": {
    "emailRequired": "Enter an email.",
    "emailInvalid": "Enter a valid email.",
    "passwordTooShort": "Password must be at least 6 characters.",
    "nameRequired": "Enter a name."
  }
}
```

- [ ] **Step 7: Write the failing test for `dictionary.ts`**

```ts
// lib/i18n/dictionary.test.ts
import { describe, it, expect } from 'vitest'
import { DICTIONARIES } from './dictionary'

describe('DICTIONARIES', () => {
  it('has both locales with the same top-level keys', () => {
    expect(Object.keys(DICTIONARIES)).toEqual(['bn', 'en'])
    expect(Object.keys(DICTIONARIES.bn).sort()).toEqual(Object.keys(DICTIONARIES.en).sort())
  })
  it('has real Bangla script for bn, not Banglish', () => {
    expect(DICTIONARIES.bn.nav.vocab).toBe('শব্দ')
    expect(DICTIONARIES.en.nav.vocab).toBe('Vocab')
  })
})
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npx vitest run lib/i18n/dictionary.test.ts`
Expected: FAIL — `Cannot find module './dictionary'`

- [ ] **Step 9: Implement `dictionary.ts`**

```ts
// lib/i18n/dictionary.ts
import bn from '@/dictionaries/bn.json'
import en from '@/dictionaries/en.json'
import type { Locale } from './locale-routing'

export type Dictionary = typeof bn

export const DICTIONARIES: Record<Locale, Dictionary> = { bn, en }
```

- [ ] **Step 10: Run tests to verify they pass**

Run: `npx vitest run lib/i18n/dictionary.test.ts lib/i18n/format.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 11: Commit**

```bash
git add dictionaries/bn.json dictionaries/en.json lib/i18n/dictionary.ts lib/i18n/dictionary.test.ts lib/i18n/format.ts lib/i18n/format.test.ts
git commit -m "feat(i18n): add bn/en dictionaries, Dictionary type, format() helper"
```

---

### Task 3: Server-side dictionary loader

**Files:**
- Create: `lib/i18n/get-dictionary.ts`
- Test: `lib/i18n/get-dictionary.test.ts`

**Interfaces:**
- Consumes: `DICTIONARIES`, `Dictionary` (Task 2).
- Produces: `getDictionary(): Promise<Dictionary>` — for use in Server Components only.

- [ ] **Step 1: Write the failing test**

```ts
// lib/i18n/get-dictionary.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/navigation', () => ({ notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }) }))
vi.mock('next/root-params', () => ({ lang: vi.fn() }))

describe('getDictionary', () => {
  it('resolves the bn dictionary for locale bn', async () => {
    const { lang } = await import('next/root-params')
    vi.mocked(lang).mockResolvedValue('bn')
    const { getDictionary } = await import('./get-dictionary')
    const dict = await getDictionary()
    expect(dict.nav.vocab).toBe('শব্দ')
  })

  it('resolves the en dictionary for locale en', async () => {
    const { lang } = await import('next/root-params')
    vi.mocked(lang).mockResolvedValue('en')
    const { getDictionary } = await import('./get-dictionary')
    const dict = await getDictionary()
    expect(dict.nav.vocab).toBe('Vocab')
  })

  it('calls notFound for an unknown locale', async () => {
    const { lang } = await import('next/root-params')
    vi.mocked(lang).mockResolvedValue('fr')
    const { getDictionary } = await import('./get-dictionary')
    await expect(getDictionary()).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/i18n/get-dictionary.test.ts`
Expected: FAIL — `Cannot find module './get-dictionary'`

- [ ] **Step 3: Implement**

```ts
// lib/i18n/get-dictionary.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/i18n/get-dictionary.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/i18n/get-dictionary.ts lib/i18n/get-dictionary.test.ts
git commit -m "feat(i18n): add getDictionary() for Server Components via next/root-params"
```

---

### Task 4: Client-side locale context

**Files:**
- Create: `lib/i18n/locale-context.tsx`
- Create: `test/render-with-locale.tsx`
- Test: `lib/i18n/locale-context.test.tsx`

**Interfaces:**
- Consumes: `Dictionary`, `DICTIONARIES` (Task 2), `Locale` (Task 1).
- Produces: `LocaleProvider({ dict, locale, children })`, `useTranslations(): { t: Dictionary; locale: Locale; format: typeof format }`. Test helper: `renderWithLocale(ui, locale?: Locale)` — renders `ui` inside `<LocaleProvider dict={DICTIONARIES[locale ?? 'bn']} locale={locale ?? 'bn'}>`.

- [ ] **Step 1: Write the failing test**

```tsx
// lib/i18n/locale-context.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/i18n/locale-context.test.tsx`
Expected: FAIL — `Cannot find module './locale-context'`

- [ ] **Step 3: Implement `locale-context.tsx`**

```tsx
// lib/i18n/locale-context.tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/i18n/locale-context.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Add the shared test helper**

```tsx
// test/render-with-locale.tsx
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
```

No test for this file itself — it's exercised by every component test that adopts it in Tasks 9–13.

- [ ] **Step 6: Commit**

```bash
git add lib/i18n/locale-context.tsx lib/i18n/locale-context.test.tsx test/render-with-locale.tsx
git commit -m "feat(i18n): add LocaleProvider/useTranslations for Client Components"
```

---

### Task 5: Locale-aware auth (validation, actions, confirm route)

**Files:**
- Modify: `lib/validation.ts`
- Modify: `lib/validation.test.ts`
- Create: `lib/i18n/current-locale.ts`
- Modify: `app/auth/actions.ts`
- Modify: `app/auth/confirm/route.ts`

**Interfaces:**
- Consumes: `Dictionary`, `DICTIONARIES` (Task 2), `Locale`, `defaultLocale`, `withLocale` (Task 1).
- Produces: `validateCredentials(t: Dictionary['validation'], email, password)`, `validateName(t: Dictionary['validation'], name)`, `currentLocale(): Promise<Locale>`.

- [ ] **Step 1: Update the failing `lib/validation.test.ts`**

```ts
// lib/validation.test.ts (replace validateCredentials/validateName describe blocks)
import { describe, it, expect } from 'vitest'
import { validateCredentials, validateName, safeRedirectPath } from './validation'
import { DICTIONARIES } from './i18n/dictionary'

const t = DICTIONARIES.bn.validation

describe('safeRedirectPath', () => {
  // unchanged from existing file
  it('keeps a same-site relative path', () => {
    expect(safeRedirectPath('/plan')).toBe('/plan')
    expect(safeRedirectPath('/vocab?tab=1')).toBe('/vocab?tab=1')
  })
  it('rejects an absolute off-site URL', () => {
    expect(safeRedirectPath('https://evil.com')).toBe('/plan')
  })
  it('rejects a protocol-relative URL', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/plan')
    expect(safeRedirectPath('/\\evil.com')).toBe('/plan')
  })
  it('rejects a bare path with no leading slash', () => {
    expect(safeRedirectPath('evil.com')).toBe('/plan')
    expect(safeRedirectPath('')).toBe('/plan')
  })
  it('uses the given fallback', () => {
    expect(safeRedirectPath('https://evil.com', '/')).toBe('/')
  })
})

describe('validateCredentials', () => {
  it('rejects an empty email', () => {
    expect(validateCredentials(t, '', 'password123')).toBe(t.emailRequired)
  })
  it('rejects an email without @', () => {
    expect(validateCredentials(t, 'not-an-email', 'password123')).toBe(t.emailInvalid)
  })
  it('rejects a password shorter than 6 characters', () => {
    expect(validateCredentials(t, 'a@b.com', '123')).toBe(t.passwordTooShort)
  })
  it('returns null for valid credentials', () => {
    expect(validateCredentials(t, 'a@b.com', 'password123')).toBeNull()
  })
})

describe('validateName', () => {
  it('rejects an empty name', () => {
    expect(validateName(t, '')).toBe(t.nameRequired)
  })
  it('rejects a whitespace-only name', () => {
    expect(validateName(t, '   ')).toBe(t.nameRequired)
  })
  it('returns null for a valid name', () => {
    expect(validateName(t, 'Mostofa')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/validation.test.ts`
Expected: FAIL — `validateCredentials`/`validateName` called with wrong argument count/type against the current signature

- [ ] **Step 3: Update `lib/validation.ts`**

```ts
// lib/validation.ts
import type { Dictionary } from './i18n/dictionary'

export function safeRedirectPath(next: string, fallback = '/plan'): string {
  if (!next.startsWith('/')) return fallback
  if (next.startsWith('//') || next.startsWith('/\\')) return fallback
  return next
}

export function validateCredentials(
  t: Dictionary['validation'],
  email: string,
  password: string
): string | null {
  if (!email.trim()) return t.emailRequired
  if (!email.includes('@')) return t.emailInvalid
  if (password.length < 6) return t.passwordTooShort
  return null
}

export function validateName(t: Dictionary['validation'], name: string): string | null {
  if (!name.trim()) return t.nameRequired
  return null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/validation.test.ts`
Expected: PASS (11 tests)

- [ ] **Step 5: Add `currentLocale()`**

```ts
// lib/i18n/current-locale.ts
import { cookies } from 'next/headers'
import { defaultLocale, type Locale } from './locale-routing'

// Server Actions and Route Handlers can't use next/root-params (App Router
// restriction), so they read the NEXT_LOCALE cookie proxy.ts sets instead.
export async function currentLocale(): Promise<Locale> {
  const store = await cookies()
  const value = store.get('NEXT_LOCALE')?.value
  return value === 'en' ? 'en' : defaultLocale
}
```

- [ ] **Step 6: Update `app/auth/actions.ts`**

```ts
// app/auth/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { validateCredentials, validateName, safeRedirectPath } from '@/lib/validation'
import { currentLocale } from '@/lib/i18n/current-locale'
import { DICTIONARIES } from '@/lib/i18n/dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'

export async function signUp(formData: FormData) {
  const locale = await currentLocale()
  const t = DICTIONARIES[locale].validation

  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const nameError = validateName(t, name)
  if (nameError) redirect(withLocale(`/signup?error=${encodeURIComponent(nameError)}`, locale))

  const error = validateCredentials(t, email, password)
  if (error) redirect(withLocale(`/signup?error=${encodeURIComponent(error)}`, locale))

  const supabase = await createServerSupabaseClient()
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name.trim() } },
  })
  if (signUpError) {
    redirect(withLocale(`/signup?error=${encodeURIComponent(signUpError.message)}`, locale))
  }

  // With "Confirm email" enabled (the default on a new Supabase project)
  // signUp returns no session, so sending the user to /plan would just bounce
  // them back to /login through the proxy with no explanation.
  if (!data.session) redirect(withLocale('/signup/check-email', locale))

  revalidatePath('/[lang]', 'layout')
  redirect(withLocale('/plan', locale))
}

export async function signIn(formData: FormData) {
  const locale = await currentLocale()
  const t = DICTIONARIES[locale].validation

  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? withLocale('/plan', locale))

  const error = validateCredentials(t, email, password)
  if (error) redirect(withLocale(`/login?error=${encodeURIComponent(error)}`, locale))

  const supabase = await createServerSupabaseClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    redirect(withLocale(`/login?error=${encodeURIComponent(signInError.message)}`, locale))
  }

  const safeNext = safeRedirectPath(next, withLocale('/plan', locale))

  // The header is rendered by an async Server Component in the root layout;
  // without this the logged-in state can stay stale after the redirect.
  revalidatePath('/[lang]', 'layout')
  redirect(safeNext)
}

export async function signOut() {
  const locale = await currentLocale()
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/[lang]', 'layout')
  redirect(withLocale('/', locale))
}
```

- [ ] **Step 7: Update `app/auth/confirm/route.ts`**

```ts
// app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { currentLocale } from '@/lib/i18n/current-locale'
import { DICTIONARIES } from '@/lib/i18n/dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'

// Target of the confirmation link Supabase emails when "Confirm email" is on.
// It exchanges the emailed token hash for a real session, then drops the user
// straight into the plan.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const locale = await currentLocale()

  if (tokenHash && type) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      return NextResponse.redirect(new URL(withLocale('/plan', locale), origin))
    }
    return NextResponse.redirect(
      new URL(withLocale(`/login?error=${encodeURIComponent(error.message)}`, locale), origin)
    )
  }

  const message = DICTIONARIES[locale].validation.emailRequired // reuse: short, already-translated fallback copy
  return NextResponse.redirect(
    new URL(withLocale(`/login?error=${encodeURIComponent(message)}`, locale), origin)
  )
}
```

Note: the confirm route's "Confirmation link ta thik nai." message has no dedicated dictionary key (it's a rare edge case — a malformed/missing confirmation link). Reusing `validation.emailRequired` as a placeholder-free stand-in would be misleading; instead add a proper key now.

- [ ] **Step 7b: Add the missing key to both dictionaries**

In `dictionaries/bn.json`, inside `"validation"`, add: `"invalidConfirmLink": "Confirmation link ta thik nai."`
In `dictionaries/en.json`, inside `"validation"`, add: `"invalidConfirmLink": "This confirmation link isn't valid."`

Then change the route's fallback to `DICTIONARIES[locale].validation.invalidConfirmLink`.

- [ ] **Step 8: Run the full test suite**

Run: `npm test -- --run`
Expected: PASS (all existing + new tests)

- [ ] **Step 9: Commit**

```bash
git add lib/validation.ts lib/validation.test.ts lib/i18n/current-locale.ts app/auth/actions.ts app/auth/confirm/route.ts dictionaries/bn.json dictionaries/en.json
git commit -m "feat(i18n): make auth validation, actions, and confirm route locale-aware"
```

---

### Task 6: `proxy.ts` locale rewrite + auth chaining

**Files:**
- Delete: `middleware.ts`
- Create: `proxy.ts`
- Modify: `lib/supabase/middleware.ts`

**Interfaces:**
- Consumes: `stripLocale`, `withLocale`, `defaultLocale`, `localeFromPathname` (Task 1).
- Produces: `updateSession(request: NextRequest, response: NextResponse): Promise<NextResponse>` (signature change — now takes and returns/augments a response instead of building its own from scratch).

- [ ] **Step 1: Update `lib/supabase/middleware.ts`**

```ts
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { stripLocale, withLocale } from '@/lib/i18n/locale-routing'

export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { locale, rest } = stripLocale(request.nextUrl.pathname)
  const isProtected = rest === '/plan' || rest.startsWith('/plan/')

  if (isProtected && !user) {
    const redirectUrl = new URL(withLocale('/login', locale), request.url)
    redirectUrl.searchParams.set('next', withLocale(rest, locale))
    const redirectResponse = NextResponse.redirect(redirectUrl)
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
    return redirectResponse
  }

  return response
}
```

- [ ] **Step 2: Create `proxy.ts`, delete `middleware.ts`**

```ts
// proxy.ts
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { localeFromPathname, defaultLocale } from '@/lib/i18n/locale-routing'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const found = localeFromPathname(pathname)

  let response: NextResponse
  if (!found) {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname}`
    response = NextResponse.rewrite(url)
  } else {
    response = NextResponse.next()
  }
  response.cookies.set('NEXT_LOCALE', found ?? defaultLocale)

  return updateSession(request, response)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

```bash
git rm middleware.ts
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test -- --run`
Expected: PASS — this task adds no new test file (per the existing accepted gap: the `updateSession`/`proxy` glue layer has zero unit coverage, same as before this feature; the pure locale-routing logic it depends on is already tested in Task 1)

- [ ] **Step 4: Run the build**

Run: `npm run build`
Expected: builds, though the `/plan` route won't resolve correctly yet — pages don't move under `app/[lang]/` until Task 7. This step is a syntax/type sanity check only; full route verification happens in Task 7's build step.

- [ ] **Step 5: Commit**

```bash
git add proxy.ts lib/supabase/middleware.ts
git commit -m "feat(i18n): rewrite proxy.ts (renamed from middleware.ts) for locale routing"
```

---

### Task 7: Directory restructure — `app/[lang]/` + root layout + home page

**Files:**
- Create: `app/[lang]/layout.tsx`
- Delete: `app/layout.tsx`
- Create: `app/[lang]/page.tsx`
- Delete: `app/page.tsx`
- Move (no content change yet, just relocate — content wired in later tasks): `app/vocab/page.tsx` → `app/[lang]/vocab/page.tsx`, `app/grammar/page.tsx` → `app/[lang]/grammar/page.tsx`, `app/practice/page.tsx` → `app/[lang]/practice/page.tsx`, `app/plan/page.tsx` → `app/[lang]/plan/page.tsx`, `app/translate/page.tsx` → `app/[lang]/translate/page.tsx`, `app/login/page.tsx` → `app/[lang]/login/page.tsx`, `app/signup/page.tsx` → `app/[lang]/signup/page.tsx`, `app/signup/check-email/page.tsx` → `app/[lang]/signup/check-email/page.tsx`

**Interfaces:**
- Consumes: `getDictionary()` (Task 3), `LocaleProvider` (Task 4), `locales` (Task 1), `useTranslations()` (Task 4, used by the home page since it's a Client Component).

- [ ] **Step 1: Move the 8 unchanged page files**

```bash
mkdir -p "app/[lang]"
git mv app/vocab "app/[lang]/vocab"
git mv app/grammar "app/[lang]/grammar"
git mv app/practice "app/[lang]/practice"
git mv app/plan "app/[lang]/plan"
git mv app/translate "app/[lang]/translate"
git mv app/login "app/[lang]/login"
git mv app/signup "app/[lang]/signup"
```

`app/plan/actions.ts` and `app/practice/actions.ts` move along with their directories — but unlike the page files, they ARE imported by absolute path (`@/app/plan/actions`, `@/app/practice/actions`) from other components, and those import paths must change to `@/app/[lang]/plan/actions` / `@/app/[lang]/practice/actions` now that the files physically live there. Update every consumer in this task:

- `components/plan/plan-task-list.tsx` — change `from '@/app/plan/actions'` to `from '@/app/[lang]/plan/actions'`
- `components/plan/plan-task-list.test.tsx` — change both the import and the `vi.mock('@/app/plan/actions', ...)` call to `'@/app/[lang]/plan/actions'`
- `components/plan/plan-start-card.tsx` — change `from '@/app/plan/actions'` to `from '@/app/[lang]/plan/actions'` (this file's own content is otherwise rewritten in Task 12 — this is just so the app keeps building in the meantime)
- `components/practice/practice-streak.tsx` — change `from '@/app/practice/actions'` to `from '@/app/[lang]/practice/actions'` (same note — content rewritten in Task 11)

(Their `revalidatePath` calls are updated separately, in Task 12.)

- [ ] **Step 2: Create the new root layout**

```tsx
// app/[lang]/layout.tsx
import type { Metadata } from 'next'
import { Fraunces, Work_Sans, Hind_Siliguri } from 'next/font/google'
import '../globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import { LocaleProvider } from '@/lib/i18n/locale-context'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { locales, type Locale } from '@/lib/i18n/locale-routing'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display-raw',
  weight: ['500', '600', '700'],
})

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-sans-raw',
  weight: ['400', '500', '600', '700'],
})

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  variable: '--font-bengali-raw',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Bolte Shikho',
  description: 'Spoken English learning platform for Bangla speakers',
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale: Locale = lang === 'en' ? 'en' : 'bn'
  const dict = await getDictionary()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${fraunces.variable} ${workSans.variable} ${hindSiliguri.variable} font-sans bg-surface text-ink antialiased`}
      >
        <LocaleProvider dict={dict} locale={locale}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SiteHeader />
            {children}
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
```

```bash
git rm app/layout.tsx
```

- [ ] **Step 3: Create the new home page**

`<Link>` doesn't know about our locale convention, so every internal href here must go through `withLocale` with the current locale — otherwise a link written as `/vocab` while browsing under `/en/...` would incorrectly drop the user back to Bangla.

```tsx
// app/[lang]/page.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTranslations } from '@/lib/i18n/locale-context'
import { withLocale } from '@/lib/i18n/locale-routing'

export default function LandingPage() {
  const { t, locale } = useTranslations()

  const FEATURES = [
    { ...t.home.features.vocab, href: withLocale('/vocab', locale) },
    { ...t.home.features.grammar, href: withLocale('/grammar', locale) },
    { ...t.home.features.practice, href: withLocale('/practice', locale) },
    { ...t.home.features.plan, href: withLocale('/plan', locale) },
    { ...t.home.features.translate, href: withLocale('/translate', locale) },
  ]

  return (
    <main>
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold text-balance md:text-5xl">
          {t.home.heading}
        </h1>
        <p className="max-w-xl text-lg text-ink-muted">{t.home.sub}</p>
        <Link href={withLocale('/signup', locale)}>
          <Button size="default">{t.home.cta}</Button>
        </Link>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link href={feature.href} className="block h-full">
              <Card className="h-full transition-colors hover:border-accent">
                <h2 className="font-display text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm text-ink-muted">{feature.body}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </section>
    </main>
  )
}
```

```bash
git rm app/page.tsx
```

- [ ] **Step 4: Run the full test suite**

Run: `npm test -- --run`
Expected: PASS (no test touches these files' internals directly yet)

- [ ] **Step 5: Run the build**

Run: `npm run build`
Expected: builds successfully, generating both `/` (bn) and `/en` route trees for every moved page (content inside those pages is still the old hardcoded strings — that's fixed page-by-page in Tasks 9–13 — but routing and the shell must already work end-to-end here)

- [ ] **Step 6: Commit**

```bash
git add "app/[lang]"
git commit -m "feat(i18n): restructure app/ under [lang], wire root layout + home page"
```

---

### Task 8: Header, nav, theme toggle, and the locale switcher

**Files:**
- Modify: `lib/nav.ts`
- Modify: `components/site-header.tsx`
- Modify: `components/mobile-nav.tsx`
- Modify: `components/theme-toggle.tsx`
- Create: `components/locale-toggle.tsx`

**Interfaces:**
- Consumes: `getDictionary()` (Task 3), `useTranslations()` (Task 4), `withLocale`, `stripLocale`, `Locale` (Task 1).
- Produces: `NAV_LINKS(t: Dictionary): { href: string; label: string }[]`, `LocaleToggle({ locale }: { locale: Locale })`.

- [ ] **Step 1: Update `lib/nav.ts` to take the dictionary**

```ts
// lib/nav.ts
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
```

- [ ] **Step 2: Update `components/site-header.tsx`**

```tsx
// components/site-header.tsx
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileNav } from '@/components/mobile-nav'
import { LocaleToggle } from '@/components/locale-toggle'
import { navLinks } from '@/lib/nav'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'
import { lang } from 'next/root-params'

export async function SiteHeader() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const t = await getDictionary()
  const locale = (await lang()) === 'en' ? 'en' : 'bn'
  const links = navLinks(t)

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href={withLocale('/', locale)} className="font-display text-lg font-semibold">
          {t.header.brand}
        </Link>
        <nav className="hidden flex-wrap gap-4 text-sm font-medium text-ink-muted md:flex">
          {links.map((link) => (
            <Link key={link.href} href={withLocale(link.href, locale)} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleToggle locale={locale} />
          <ThemeToggle />
          {user ? (
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                {t.header.logout}
              </Button>
            </form>
          ) : (
            <Link href={withLocale('/login', locale)}>
              <Button type="button" size="sm">
                {t.header.login}
              </Button>
            </Link>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Update `components/mobile-nav.tsx`**

```tsx
// components/mobile-nav.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { navLinks } from '@/lib/nav'
import { useTranslations } from '@/lib/i18n/locale-context'
import { withLocale } from '@/lib/i18n/locale-routing'

// SiteHeader is an async Server Component and cannot hold state, so the
// mobile disclosure lives here as its own client island.
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { t, locale } = useTranslations()
  const links = navLinks(t)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t.header.closeMenu : t.header.openMenu}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="cursor-pointer rounded-md p-2 text-ink-muted hover:bg-surface-alt hover:text-ink"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <nav
          id="mobile-nav-panel"
          className="absolute left-0 right-0 top-full flex flex-col gap-1 border-b border-border bg-surface px-6 py-3 text-sm font-medium text-ink-muted shadow-sm"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={withLocale(link.href, locale)}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 hover:bg-surface-alt hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update `components/theme-toggle.tsx`**

```tsx
// components/theme-toggle.tsx (only the aria-label line changes)
'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/i18n/locale-context'

const noopSubscribe = () => () => {}

function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const { t } = useTranslations()

  const isDark = hydrated && resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={t.header.toggleTheme}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  )
}
```

- [ ] **Step 5: Update `components/theme-toggle.test.tsx`**

The existing test queries the button by `name: /theme/i` — that regex matches the current hardcoded English `aria-label="Toggle theme"`, but the bn dictionary's `header.toggleTheme` is real Bangla script ("থিম পরিবর্তন করো"), which the regex won't match. Wrap with `LocaleProvider` and match on the actual bn dictionary value instead of an English-only regex:

```tsx
// components/theme-toggle.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@/components/theme-provider'
import { LocaleProvider } from '@/lib/i18n/locale-context'
import { DICTIONARIES } from '@/lib/i18n/dictionary'
import { ThemeToggle } from './theme-toggle'

describe('ThemeToggle', () => {
  it('toggles the aria-pressed state when clicked', async () => {
    render(
      <LocaleProvider dict={DICTIONARIES.bn} locale="bn">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeToggle />
        </ThemeProvider>
      </LocaleProvider>
    )
    const button = await screen.findByRole('button', { name: DICTIONARIES.bn.header.toggleTheme })
    const before = button.getAttribute('aria-pressed')
    await userEvent.click(button)
    expect(button.getAttribute('aria-pressed')).not.toBe(before)
  })
})
```

(This test predates `render-with-locale.tsx` and needs `ThemeProvider` nested too, which the generic helper doesn't provide — write `LocaleProvider` directly here rather than using `renderWithLocale`.)

- [ ] **Step 6: Create `components/locale-toggle.tsx`**

```tsx
// components/locale-toggle.tsx
'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { stripLocale, withLocale, type Locale } from '@/lib/i18n/locale-routing'

export function LocaleToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const other: Locale = locale === 'bn' ? 'en' : 'bn'
  const { rest } = stripLocale(pathname)
  const query = searchParams.toString()
  const href = withLocale(rest, other) + (query ? `?${query}` : '')

  return (
    <Link
      href={href}
      className="cursor-pointer rounded-md px-2 py-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
    >
      {other === 'bn' ? 'বাংলা' : 'English'}
    </Link>
  )
}
```

- [ ] **Step 7: Run the full test suite**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 8: Run the build**

Run: `npm run build`
Expected: builds; header/nav/theme-toggle/locale-toggle render for both `/` and `/en`

- [ ] **Step 9: Manual check**

Run: `npm run dev`, open `http://localhost:3000/`, confirm nav shows Bangla labels and a "English" toggle link; click it, confirm URL becomes `/en` and nav switches to English with a "বাংলা" toggle link back.

- [ ] **Step 10: Commit**

```bash
git add lib/nav.ts components/site-header.tsx components/mobile-nav.tsx components/theme-toggle.tsx components/theme-toggle.test.tsx components/locale-toggle.tsx
git commit -m "feat(i18n): translate header/nav/theme-toggle, add the locale switcher"
```

---

### Task 9: Vocab feature

**Files:**
- Modify: `app/[lang]/vocab/page.tsx`
- Modify: `components/vocab/vocab-browser.tsx`
- Modify: `components/vocab/category-chips.tsx`
- Modify: `components/vocab/word-card.tsx`
- Modify: `components/vocab/word-card.test.tsx`

**Interfaces:**
- Consumes: `getDictionary()` (Task 3), `useTranslations()`, `format()` (Task 4).

- [ ] **Step 1: Update `app/[lang]/vocab/page.tsx`**

```tsx
// app/[lang]/vocab/page.tsx
import { VocabBrowser } from '@/components/vocab/vocab-browser'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function VocabPage() {
  const t = await getDictionary()
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">{t.vocab.heading}</h1>
      <p className="mt-1 text-ink-muted">{t.vocab.description}</p>
      <div className="mt-6">
        <VocabBrowser />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Update `components/vocab/vocab-browser.tsx`**

```tsx
// components/vocab/vocab-browser.tsx
'use client'

import { useMemo, useState } from 'react'
import { VOCAB } from '@/data/vocab'
import { filterVocab } from '@/lib/vocab-filter'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { CategoryChips } from './category-chips'
import { WordCard } from './word-card'
import { useTranslations } from '@/lib/i18n/locale-context'

export function VocabBrowser() {
  const { t, format } = useTranslations()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [quizMode, setQuizMode] = useState(false)
  const [rate, setRate] = useState(1)

  const filtered = useMemo(() => filterVocab(VOCAB, query, category), [query, category])
  const totalWords = useMemo(() => VOCAB.reduce((n, c) => n + c.words.length, 0), [])
  const shownWords = useMemo(() => filtered.reduce((n, c) => n + c.words.length, 0), [filtered])

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder={t.vocab.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <CategoryChips categories={VOCAB.map((c) => c.name)} active={category} onChange={setCategory} />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
        <span>
          {query || category !== 'All'
            ? format(t.vocab.wordCountFiltered, { shown: shownWords, total: totalWords })
            : format(t.vocab.wordCountAll, { total: totalWords })}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRate(1)}
            className={`cursor-pointer ${rate === 1 ? 'font-semibold text-accent' : ''}`}
          >
            {t.vocab.normalSpeed}
          </button>
          <button
            type="button"
            onClick={() => setRate(0.7)}
            className={`cursor-pointer ${rate === 0.7 ? 'font-semibold text-accent' : ''}`}
          >
            {t.vocab.slowSpeed}
          </button>
        </div>
        <label className="flex items-center gap-2">
          {t.vocab.quizMode}
          <Checkbox checked={quizMode} onChange={(e) => setQuizMode(e.target.checked)} />
        </label>
      </div>

      {filtered.map((cat) => (
        <section key={cat.name} className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-semibold">{cat.name}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {cat.words.map((word) => (
              <WordCard key={word.en} word={word} quizMode={quizMode} rate={rate} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
```

Note: `category` names themselves (`cat.name`, e.g. "Pronoun") come from `data/vocab.ts` — out of scope per spec, left untranslated by design.

- [ ] **Step 3: Update `components/vocab/category-chips.tsx`**

```tsx
// components/vocab/category-chips.tsx
'use client'

import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n/locale-context'

export function CategoryChips({
  categories,
  active,
  onChange,
}: {
  categories: string[]
  active: string
  onChange: (category: string) => void
}) {
  const { t } = useTranslations()
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {[{ key: 'All', label: t.vocab.all }, ...categories.map((c) => ({ key: c, label: c }))].map(
        (category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => onChange(category.key)}
            className={cn(
              'flex-none cursor-pointer whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium',
              active === category.key
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-border bg-surface text-ink-muted'
            )}
          >
            {category.label}
          </button>
        )
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update `components/vocab/word-card.tsx`**

```tsx
// components/vocab/word-card.tsx
'use client'

import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { VocabWord } from '@/data/vocab'
import { speak } from '@/lib/speech'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n/locale-context'

export function WordCard({
  word,
  quizMode,
  rate,
}: {
  word: VocabWord
  quizMode: boolean
  rate: number
}) {
  const { t } = useTranslations()
  const [revealed, setRevealed] = useState(false)
  const showMeaning = !quizMode || revealed

  return (
    <div
      className="grid cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1 rounded-xl border border-border bg-surface p-4"
      onClick={() => setRevealed((r) => !r)}
    >
      <span className="font-semibold">{word.en}</span>
      <button
        type="button"
        aria-label={t.vocab.listen}
        onClick={(e) => {
          e.stopPropagation()
          speak(word.en, rate)
        }}
        className="cursor-pointer rounded-md p-1 text-accent hover:bg-surface-alt"
      >
        <Volume2 size={16} />
      </button>
      {showMeaning ? (
        <span className="col-span-2 flex flex-wrap gap-2 font-bengali text-sm">
          <span className="text-accent">{word.pron}</span>
          <span className="text-ink-muted">— {word.mean}</span>
        </span>
      ) : (
        <span className={cn('col-span-2 font-bengali text-xs text-ink-muted opacity-70')}>
          {t.vocab.tapToReveal}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Update `components/vocab/word-card.test.tsx`**

```tsx
// components/vocab/word-card.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { WordCard } from './word-card'
import { renderWithLocale } from '@/test/render-with-locale'

vi.mock('@/lib/speech', () => ({ speak: vi.fn() }))

describe('WordCard', () => {
  it('shows the English word and, once revealed, the pronunciation and meaning', async () => {
    renderWithLocale(<WordCard word={{ en: 'Red', pron: 'রেড', mean: 'লাল' }} quizMode={true} rate={1} />)
    expect(screen.getByText('Red')).toBeInTheDocument()
    expect(screen.queryByText('রেড')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Red'))
    expect(screen.getByText('রেড')).toBeInTheDocument()
    expect(screen.getByText('লাল', { exact: false })).toBeInTheDocument()
  })

  it('always shows pronunciation and meaning when quiz mode is off', () => {
    renderWithLocale(<WordCard word={{ en: 'Red', pron: 'রেড', mean: 'লাল' }} quizMode={false} rate={1} />)
    expect(screen.getByText('রেড')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run the full test suite**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 7: Run the build**

Run: `npm run build`
Expected: builds

- [ ] **Step 8: Commit**

```bash
git add "app/[lang]/vocab" components/vocab
git commit -m "feat(i18n): translate the vocab page and its components"
```

---

### Task 10: Grammar feature

**Files:**
- Modify: `app/[lang]/grammar/page.tsx`
- Modify: `components/grammar/grammar-steps.tsx`
- Modify: `components/grammar/grammar-steps.test.tsx`

**Interfaces:**
- Consumes: `getDictionary()` (Task 3), `useTranslations()` (Task 4).

- [ ] **Step 1: Update `app/[lang]/grammar/page.tsx`**

```tsx
// app/[lang]/grammar/page.tsx
import { GRAMMAR_STEPS } from '@/data/grammar'
import { GrammarSteps } from '@/components/grammar/grammar-steps'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function GrammarPage() {
  const t = await getDictionary()
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">{t.grammar.heading}</h1>
      <p className="mt-1 text-ink-muted">{t.grammar.description}</p>
      <div className="mt-6">
        <GrammarSteps steps={GRAMMAR_STEPS} />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Update `components/grammar/grammar-steps.tsx`** (only the aria-label changes)

```tsx
// components/grammar/grammar-steps.tsx
'use client'

import { Volume2 } from 'lucide-react'
import type { GrammarStep } from '@/data/grammar'
import { speak } from '@/lib/speech'
import { useTranslations } from '@/lib/i18n/locale-context'

export function GrammarSteps({ steps }: { steps: GrammarStep[] }) {
  const { t } = useTranslations()
  return (
    <div className="flex flex-col gap-10">
      {steps.map((step) => (
        <section key={step.title} className="flex flex-col gap-3 border-b border-border pb-8">
          <div className="flex items-baseline gap-3 border-b border-border pb-1.5">
            {step.number && <span className="font-display text-xl font-bold text-accent">{step.number}</span>}
            <h2 className="font-display text-lg font-bold">{step.title}</h2>
          </div>
          {step.intro && <p className="font-bengali text-sm text-ink-muted">{step.intro}</p>}

          {step.blocks.map((block, bi) => (
            <div key={bi} className="flex flex-col gap-2">
              {block.structure && (
                <div className="rounded-lg border border-border bg-surface p-3 font-semibold">
                  {block.structure}
                </div>
              )}
              {block.tag && <p className="font-bengali text-sm text-ink-muted">{block.tag}</p>}
              {block.examples.length > 0 && (
                <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
                  {block.examples.map((example, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3">
                      <span className="flex items-center gap-2 font-semibold">
                        {example.en}
                        <button
                          type="button"
                          aria-label={t.grammar.listen}
                          onClick={() => speak(example.en)}
                          className="cursor-pointer rounded-md p-1 text-accent hover:bg-surface-alt"
                        >
                          <Volume2 size={14} />
                        </button>
                      </span>
                      <span className="font-bengali text-sm text-accent">{example.pron}</span>
                      <span className="font-bengali text-sm text-ink-muted">{example.mean}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {step.table && (
            <table className="w-full border-collapse overflow-hidden rounded-xl border border-border text-sm">
              <thead>
                <tr>
                  {step.table.headers.map((header) => (
                    <th
                      key={header}
                      className="border-b border-border bg-surface-alt p-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {step.table.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border-b border-border p-2 last:border-b-0">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {step.note && <p className="font-bengali text-sm text-ink-muted">{step.note}</p>}
        </section>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Update `components/grammar/grammar-steps.test.tsx`** (wrap render, keep all assertions — none touch the translated "Listen" aria-label)

```tsx
// components/grammar/grammar-steps.test.tsx
import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GrammarSteps } from './grammar-steps'
import type { GrammarStep } from '@/data/grammar'
import { renderWithLocale } from '@/test/render-with-locale'

const STEPS: GrammarStep[] = [
  {
    number: '১',
    title: 'Present Simple',
    intro: 'test intro',
    blocks: [
      {
        structure: 'Subject + verb',
        examples: [{ en: 'I go.', pron: 'আই গো', mean: 'আমি যাই।' }],
      },
    ],
  },
  {
    number: '৪',
    title: 'Irregular Verb',
    blocks: [],
    table: { headers: ['Base', 'Past'], rows: [['go', 'went']] },
  },
]

describe('GrammarSteps', () => {
  it('renders a step title, its structure, and its examples', () => {
    renderWithLocale(<GrammarSteps steps={STEPS} />)
    expect(screen.getByText('Present Simple')).toBeInTheDocument()
    expect(screen.getByText('Subject + verb')).toBeInTheDocument()
    expect(screen.getByText('I go.')).toBeInTheDocument()
    expect(screen.getByText('আই গো')).toBeInTheDocument()
  })

  it('renders a table when the step has one instead of examples', () => {
    renderWithLocale(<GrammarSteps steps={STEPS} />)
    expect(screen.getByText('Irregular Verb')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'went' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run the full test suite**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 5: Run the build**

Run: `npm run build`
Expected: builds

- [ ] **Step 6: Commit**

```bash
git add "app/[lang]/grammar" components/grammar
git commit -m "feat(i18n): translate the grammar page and its Listen buttons"
```

---

### Task 11: Practice feature

**Files:**
- Modify: `app/[lang]/practice/page.tsx`
- Modify: `components/practice/practice-streak.tsx`
- Modify: `components/practice/prompt-card.tsx`
- Modify: `components/practice/prompt-card.test.tsx`
- Modify: `components/practice/pronunciation-check.tsx`
- Modify: `components/practice/dialogue-list.tsx`

**Interfaces:**
- Consumes: `getDictionary()` (Task 3), `useTranslations()`, `format()` (Task 4).

- [ ] **Step 1: Update `app/[lang]/practice/page.tsx`** (only the `<h1>` line changes)

```tsx
// app/[lang]/practice/page.tsx
import { PROMPTS } from '@/data/prompts'
import { DIALOGUES } from '@/data/dialogues'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { computePracticeStreak, todayISO } from '@/lib/scoring'
import { PromptCard } from '@/components/practice/prompt-card'
import { PronunciationCheck } from '@/components/practice/pronunciation-check'
import { DialogueList } from '@/components/practice/dialogue-list'
import { PracticeStreak } from '@/components/practice/practice-streak'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function PracticePage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const t = await getDictionary()

  const today = todayISO()
  let logDates: string[] = []

  if (user) {
    const { data: logRows } = await supabase
      .from('practice_log')
      .select('log_date')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })
      .limit(60)
    logDates = (logRows ?? []).map((row) => row.log_date as string)
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">{t.practice.heading}</h1>
      <PracticeStreak
        initialStreak={computePracticeStreak(logDates, today)}
        initialDoneToday={logDates.includes(today)}
      />
      <PromptCard prompts={PROMPTS} />
      <PronunciationCheck />
      <DialogueList dialogues={DIALOGUES} />
    </main>
  )
}
```

- [ ] **Step 2: Update `components/practice/practice-streak.tsx`**

```tsx
// components/practice/practice-streak.tsx
'use client'

import { useState } from 'react'
import { CheckCircle2, Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logPracticeToday } from '@/app/[lang]/practice/actions'
import { useTranslations } from '@/lib/i18n/locale-context'

export function PracticeStreak({
  initialStreak,
  initialDoneToday,
}: {
  initialStreak: number
  initialDoneToday: boolean
}) {
  const { t, format } = useTranslations()
  const [status, setStatus] = useState<'idle' | 'done' | 'guest'>(
    initialDoneToday ? 'done' : 'idle'
  )
  const [streak, setStreak] = useState(initialStreak)

  async function handleClick() {
    const result = await logPracticeToday()
    if (result.loggedIn) {
      setStatus('done')
      setStreak((current) => (initialDoneToday ? current : current + 1))
    } else {
      setStatus('guest')
    }
  }

  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {t.practice.streak.label}
      </span>
      <p className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold">
        <Flame size={20} className={streak > 0 ? 'text-accent' : 'text-ink-muted'} />
        {format(t.practice.streak.days, { n: streak })}
      </p>
      <p className="mt-1 font-bengali text-sm text-ink-muted">
        {streak > 0 ? t.practice.streak.encourageActive : t.practice.streak.encourageStart}
      </p>
      <Button className="mt-4" onClick={handleClick} disabled={status === 'done'}>
        {status === 'done' && <CheckCircle2 size={16} />}
        {status === 'done' ? t.practice.streak.doneButton : t.practice.streak.actionButton}
      </Button>
      {status === 'guest' && (
        <p className="mt-2 font-bengali text-sm text-bad">{t.practice.streak.guestNotice}</p>
      )}
    </Card>
  )
}
```

- [ ] **Step 3: Update `components/practice/prompt-card.tsx`**

```tsx
// components/practice/prompt-card.tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/i18n/locale-context'

export function PromptCard({ prompts }: { prompts: string[] }) {
  const { t } = useTranslations()
  // Starts deterministically at the first prompt: Math.random() in the
  // initializer produced a different value on the server than at hydration,
  // which mismatched and made the visible prompt swap right after load.
  const [index, setIndex] = useState(0)

  function next() {
    setIndex((current) => {
      if (prompts.length <= 1) return current
      let n = current
      while (n === current) n = Math.floor(Math.random() * prompts.length)
      return n
    })
  }

  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {t.practice.prompt.label}
      </span>
      <p data-testid="prompt-text" className="mt-2 font-bengali text-lg">
        {prompts[index]}
      </p>
      <Button className="mt-4" onClick={next}>
        {t.practice.prompt.next}
      </Button>
    </Card>
  )
}
```

- [ ] **Step 4: Update `components/practice/prompt-card.test.tsx`**

```tsx
// components/practice/prompt-card.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { PromptCard } from './prompt-card'
import { renderWithLocale } from '@/test/render-with-locale'
import { DICTIONARIES } from '@/lib/i18n/dictionary'

describe('PromptCard', () => {
  it('shows one of the given prompts and swaps to another on click', async () => {
    const prompts = ['Prompt A', 'Prompt B']
    renderWithLocale(<PromptCard prompts={prompts} />)
    expect(prompts).toContain(screen.getByTestId('prompt-text').textContent)

    await userEvent.click(screen.getByRole('button', { name: DICTIONARIES.bn.practice.prompt.next }))
    expect(prompts).toContain(screen.getByTestId('prompt-text').textContent)
  })
})
```

- [ ] **Step 5: Update `components/practice/pronunciation-check.tsx`**

```tsx
// components/practice/pronunciation-check.tsx
'use client'

import { useEffect, useState } from 'react'
import { Volume2, Mic, CheckCircle2, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VOCAB } from '@/data/vocab'
import { speak, normalizeSpeech, isSpeechRecognitionSupported, createRecognition } from '@/lib/speech'
import { useTranslations } from '@/lib/i18n/locale-context'

const ALL_WORDS = VOCAB.flatMap((category) => category.words.map((w) => w.en))

export function PronunciationCheck() {
  const { t, format } = useTranslations()
  // Starts false to match SSR (no `window` on the server), then flips after
  // mount once the browser's real capability is known.
  const [supported, setSupported] = useState(false)
  useEffect(() => setSupported(isSpeechRecognitionSupported()), [])
  const [target, setTarget] = useState(ALL_WORDS[0])
  const [result, setResult] = useState<{ ok: boolean; heard: string } | null>(null)
  const [listening, setListening] = useState(false)

  function nextTarget() {
    setTarget((current) => {
      if (ALL_WORDS.length <= 1) return current
      let next = current
      while (next === current) next = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)]
      return next
    })
    setResult(null)
  }

  function startListening() {
    const recognition = createRecognition()
    if (!recognition) return
    setListening(true)
    recognition.onresult = (event) => {
      const heard = event.results[0][0].transcript
      setResult({ ok: normalizeSpeech(heard) === normalizeSpeech(target), heard })
    }
    recognition.onerror = () => setResult({ ok: false, heard: '' })
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {t.practice.pronunciation.label}
      </span>
      <p className="mt-2 font-bengali text-lg">{target}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="ghost" onClick={() => speak(target)}>
          <Volume2 size={16} /> {t.practice.pronunciation.listen}
        </Button>
        <Button onClick={startListening} disabled={!supported || listening}>
          <Mic size={16} /> {listening ? t.practice.pronunciation.listening : t.practice.pronunciation.micButton}
        </Button>
        <Button variant="ghost" onClick={nextTarget}>
          {t.practice.pronunciation.nextWord}
        </Button>
      </div>
      {!supported && (
        <p className="mt-3 font-bengali text-sm text-ink-muted">{t.practice.pronunciation.unsupported}</p>
      )}
      {result && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
            result.ok ? 'border-good text-good' : 'border-bad text-bad'
          }`}
        >
          {result.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {format(result.ok ? t.practice.pronunciation.correct : t.practice.pronunciation.incorrect, {
            heard: result.heard,
          })}
        </div>
      )}
    </Card>
  )
}
```

- [ ] **Step 6: Update `components/practice/dialogue-list.tsx`** (only the aria-label changes)

```tsx
// components/practice/dialogue-list.tsx
'use client'

import { Volume2 } from 'lucide-react'
import type { Dialogue } from '@/data/dialogues'
import { speak } from '@/lib/speech'
import { useTranslations } from '@/lib/i18n/locale-context'

export function DialogueList({ dialogues }: { dialogues: Dialogue[] }) {
  const { t } = useTranslations()
  return (
    <div className="flex flex-col gap-8">
      {dialogues.map((dialogue) => (
        <div key={dialogue.title}>
          <h3 className="font-semibold">{dialogue.title}</h3>
          <div className="mt-2 flex flex-col divide-y divide-border rounded-xl border border-border">
            {dialogue.lines.map((line, i) => (
              <div key={i} className="flex flex-col gap-1 p-3">
                <span className="flex items-center gap-2 font-semibold">
                  {line.speaker && <span className="text-accent">{line.speaker}:</span>} {line.en}
                  <button
                    type="button"
                    aria-label={t.practice.dialogue.listen}
                    onClick={() => speak(line.en)}
                    className="cursor-pointer rounded-md p-1 text-accent hover:bg-surface-alt"
                  >
                    <Volume2 size={14} />
                  </button>
                </span>
                <span className="font-bengali text-sm text-accent">{line.pron}</span>
                <span className="font-bengali text-sm text-ink-muted">{line.mean}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 7: Run the full test suite**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 8: Run the build**

Run: `npm run build`
Expected: builds

- [ ] **Step 9: Commit**

```bash
git add "app/[lang]/practice" components/practice
git commit -m "feat(i18n): translate the practice page and its components"
```

---

### Task 12: Plan feature (+ locale-safe `revalidatePath`)

**Files:**
- Modify: `app/[lang]/plan/page.tsx`
- Modify: `components/plan/plan-client.tsx`
- Modify: `components/plan/plan-score-card.tsx`
- Modify: `components/plan/plan-start-card.tsx`
- Modify: `app/[lang]/plan/actions.ts`
- Modify: `app/[lang]/practice/actions.ts`

**Interfaces:**
- Consumes: `getDictionary()` (Task 3), `useTranslations()`, `format()` (Task 4).
- Note: `plan-calendar.tsx` and `plan-task-list.tsx` need no changes in THIS task — confirmed in the spec's inventory they carry no literal UI strings (day numbers and task text, the latter from `data/plan-tasks.ts`, out of scope). Task 7 already updated `plan-task-list.tsx`'s import path (`@/app/[lang]/plan/actions`) as a necessary side effect of the directory move — that's already done, not this task's concern.

- [ ] **Step 1: Update `app/[lang]/plan/page.tsx`**

```tsx
// app/[lang]/plan/page.tsx
import { PLAN_TASKS } from '@/data/plan-tasks'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  dateFromStartOffset,
  getCurrentPlanDay,
  computeDayStatus,
  computeScore,
  todayISO,
} from '@/lib/scoring'
import { PlanStartCard } from '@/components/plan/plan-start-card'
import { PlanClient } from '@/components/plan/plan-client'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function PlanPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const t = await getDictionary()

  const today = todayISO()

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">{t.plan.headingGuest}</h1>
        <p className="mt-4 font-bengali text-ink-muted">{t.plan.loginPrompt}</p>
      </main>
    )
  }

  const { data: startRow } = await supabase
    .from('plan_start')
    .select('start_date')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!startRow) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">{t.plan.headingGuest}</h1>
        <div className="mt-6">
          <PlanStartCard today={today} />
        </div>
      </main>
    )
  }

  const [{ data: progressRows }, { data: completionRows }] = await Promise.all([
    supabase.from('plan_task_progress').select('plan_day, task_index, completed_at').eq('user_id', user.id),
    supabase.from('plan_day_completion').select('plan_day, completed_date').eq('user_id', user.id),
  ])

  const checkedByDay: boolean[][] = PLAN_TASKS.map((tasks) => tasks.map(() => false))
  for (const row of progressRows ?? []) {
    if (row.completed_at) checkedByDay[row.plan_day - 1][row.task_index] = true
  }
  const completedDateByDay = new Map((completionRows ?? []).map((r) => [r.plan_day, r.completed_date]))

  const currentDay = getCurrentPlanDay(startRow.start_date, PLAN_TASKS.length, today)

  const statuses = PLAN_TASKS.map((tasks, idx) => {
    const dayNumber = idx + 1
    const checkedCount = checkedByDay[idx].filter(Boolean).length
    return computeDayStatus({
      startDate: startRow.start_date,
      dayNumber,
      taskCount: tasks.length,
      checkedCount,
      completedDate: completedDateByDay.get(dayNumber) ?? null,
      today,
    })
  })

  const { score, doneOnTime } = computeScore(
    PLAN_TASKS.map((tasks, idx) => ({
      taskCount: tasks.length,
      checkedCount: checkedByDay[idx].filter(Boolean).length,
      scheduledDate: dateFromStartOffset(startRow.start_date, idx),
      completedDate: completedDateByDay.get(idx + 1) ?? null,
    }))
  )

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">{t.plan.headingScore}</h1>
      <PlanClient
        currentDay={currentDay}
        statuses={statuses}
        score={score}
        doneOnTime={doneOnTime}
        checkedByDay={checkedByDay}
      />
    </main>
  )
}
```

- [ ] **Step 2: Update `components/plan/plan-client.tsx`**

```tsx
// components/plan/plan-client.tsx
'use client'

import { useState } from 'react'
import { PLAN_TASKS } from '@/data/plan-tasks'
import type { DayStatus } from '@/lib/scoring'
import { PlanScoreCard } from './plan-score-card'
import { PlanCalendar } from './plan-calendar'
import { PlanTaskList } from './plan-task-list'
import { useTranslations } from '@/lib/i18n/locale-context'

export function PlanClient({
  currentDay,
  statuses,
  score,
  doneOnTime,
  checkedByDay,
}: {
  currentDay: number
  statuses: DayStatus[]
  score: number
  doneOnTime: number
  checkedByDay: boolean[][]
}) {
  const { t, format } = useTranslations()
  const [selected, setSelected] = useState(currentDay)

  return (
    <div className="mt-6 flex flex-col gap-6">
      <PlanScoreCard score={score} currentDay={currentDay} totalDays={PLAN_TASKS.length} doneOnTime={doneOnTime} />
      <PlanCalendar
        totalDays={PLAN_TASKS.length}
        statuses={statuses}
        today={currentDay}
        selected={selected}
        onSelect={setSelected}
      />
      <div>
        <h2 className="mb-2 font-semibold">{format(t.plan.day, { day: selected })}</h2>
        <PlanTaskList day={selected} tasks={PLAN_TASKS[selected - 1]} checked={checkedByDay[selected - 1]} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update `components/plan/plan-score-card.tsx`**

```tsx
// components/plan/plan-score-card.tsx
import { Card } from '@/components/ui/card'
import { useTranslations } from '@/lib/i18n/locale-context'

export function PlanScoreCard({
  score,
  currentDay,
  totalDays,
  doneOnTime,
}: {
  score: number
  currentDay: number
  totalDays: number
  doneOnTime: number
}) {
  const { t } = useTranslations()
  const stats = [
    { label: t.plan.score, value: score },
    { label: t.plan.dayOfTotal, value: `${currentDay}/${totalDays}` },
    { label: t.plan.onTime, value: doneOnTime },
  ]
  return (
    <Card>
      <div className="flex flex-wrap gap-6">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="font-display text-2xl font-bold tabular-nums">{stat.value}</div>
            <div className="text-xs uppercase tracking-wide text-ink-muted">{stat.label}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
```

Note: `PlanScoreCard` was a Server-Component-compatible file (no `'use client'`) before — it now needs `useTranslations()`, which only works inside a `LocaleProvider` from a Client Component tree. Since its parent `PlanClient` is already `'use client'` (see Step 2), add `'use client'` to the top of this file too.

```tsx
// components/plan/plan-score-card.tsx (final — add the directive)
'use client'

import { Card } from '@/components/ui/card'
import { useTranslations } from '@/lib/i18n/locale-context'
// ... rest unchanged from above
```

- [ ] **Step 4: Update `components/plan/plan-start-card.tsx`**

```tsx
// components/plan/plan-start-card.tsx
'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { startPlan } from '@/app/[lang]/plan/actions'
import { useTranslations } from '@/lib/i18n/locale-context'

export function PlanStartCard({ today }: { today: string }) {
  const { t, format } = useTranslations()
  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {t.plan.startLabel}
      </span>
      <p className="mt-2 font-bengali">{format(t.plan.startBody, { today })}</p>
      <form action={startPlan}>
        <Button className="mt-4" type="submit">
          {t.plan.startButton}
        </Button>
      </form>
    </Card>
  )
}
```

Note: this file was previously a Server Component (no `'use client'`, rendered directly by the async `PlanPage`). It now needs `'use client'` since it calls `useTranslations()`. `startPlan` is a Server Action imported into a Client Component, which is the standard, supported pattern (same as `plan-task-list.tsx` already does with `toggleTask`).

- [ ] **Step 5: Update `app/[lang]/plan/actions.ts`** (only the two `revalidatePath` calls change)

```ts
// app/[lang]/plan/actions.ts (change both occurrences)
revalidatePath('/[lang]/plan', 'page')
```

(Two call sites: end of `startPlan` and end of `toggleTask`. Leave everything else in the file unchanged.)

- [ ] **Step 6: Update `app/[lang]/practice/actions.ts`** (the one `revalidatePath` call changes)

```ts
// app/[lang]/practice/actions.ts (change the one occurrence)
revalidatePath('/[lang]/practice', 'page')
```

- [ ] **Step 7: Run the full test suite**

Run: `npm test -- --run`
Expected: PASS — `plan-task-list.test.tsx` and `plan-calendar.test.tsx` are untouched and still render their components directly (no `LocaleProvider` needed, since neither of those two files calls `useTranslations()`)

- [ ] **Step 8: Run the build**

Run: `npm run build`
Expected: builds

- [ ] **Step 9: Manual check**

Run: `npm run dev`, log in, visit `/plan` and `/en/plan`, toggle a task checkbox on each, confirm the page still updates (revalidation still works with the dynamic-segment `revalidatePath` pattern).

- [ ] **Step 10: Commit**

```bash
git add "app/[lang]/plan" components/plan "app/[lang]/plan/actions.ts" "app/[lang]/practice/actions.ts"
git commit -m "feat(i18n): translate the plan page, fix revalidatePath for [lang] routes"
```

---

### Task 13: Translate, login, signup, check-email pages

**Files:**
- Modify: `app/[lang]/translate/page.tsx`
- Modify: `components/translate/translator-form.tsx`
- Modify: `app/[lang]/login/page.tsx`
- Modify: `app/[lang]/signup/page.tsx`
- Modify: `app/[lang]/signup/check-email/page.tsx`

**Interfaces:**
- Consumes: `getDictionary()` (Task 3), `useTranslations()` (Task 4), `withLocale` (Task 1).

- [ ] **Step 1: Update `app/[lang]/translate/page.tsx`**

```tsx
// app/[lang]/translate/page.tsx
import { TranslatorForm } from '@/components/translate/translator-form'
import { getDictionary } from '@/lib/i18n/get-dictionary'

export default async function TranslatePage() {
  const t = await getDictionary()
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">{t.translate.heading}</h1>
      <p className="mt-1 text-ink-muted">{t.translate.description}</p>
      <div className="mt-6">
        <TranslatorForm />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Update `components/translate/translator-form.tsx`**

```tsx
// components/translate/translator-form.tsx
'use client'

import { useState } from 'react'
import { ArrowLeftRight, Volume2, Mic } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { speak, createRecognition } from '@/lib/speech'
import { useTranslations } from '@/lib/i18n/locale-context'

type Lang = 'en' | 'bn'

export function TranslatorForm() {
  const { t } = useTranslations()
  const LABEL: Record<Lang, string> = { en: t.translate.langEn, bn: t.translate.langBn }
  const [from, setFrom] = useState<Lang>('en')
  const [to, setTo] = useState<Lang>('bn')
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function translate() {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from, to }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? t.translate.genericError)
      setResult(data.translatedText)
    } catch {
      setError(t.translate.error)
    } finally {
      setLoading(false)
    }
  }

  function swap() {
    setFrom(to)
    setTo(from)
    setText(result)
    setResult(text)
  }

  function startMic() {
    const recognition = createRecognition()
    if (!recognition) return
    recognition.lang = from === 'en' ? 'en-US' : 'bn-BD'
    recognition.onresult = (event) => setText(event.results[0][0].transcript)
    recognition.start()
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{LABEL[from]}</span>
        <button
          type="button"
          onClick={swap}
          aria-label={t.translate.swap}
          className="cursor-pointer rounded-md p-1 hover:bg-surface-alt"
        >
          <ArrowLeftRight size={16} />
        </button>
        <span className="font-semibold">{LABEL[to]}</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        maxLength={490}
        placeholder={t.translate.placeholder}
        className="mt-3 w-full rounded-lg border border-border bg-surface p-3 font-bengali text-sm"
      />

      <div className="mt-2 flex gap-2">
        <Button variant="ghost" size="sm" onClick={startMic} type="button" aria-label={t.translate.speakToFill}>
          <Mic size={16} />
        </Button>
        <Button size="sm" onClick={translate} disabled={loading} type="button">
          {loading ? t.translate.translating : t.translate.translateButton}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-bad">{error}</p>}

      {result && (
        <div className="mt-4 rounded-lg border border-border bg-surface-alt p-3">
          <p className="font-bengali text-lg">{result}</p>
          <button
            type="button"
            onClick={() => speak(result, 1, to === 'bn' ? 'bn-BD' : 'en-US')}
            aria-label={t.translate.listen}
            className="mt-2 flex cursor-pointer items-center gap-1 text-sm text-accent"
          >
            <Volume2 size={14} /> {t.translate.listen}
          </button>
        </div>
      )}
    </Card>
  )
}
```

- [ ] **Step 3: Update `app/[lang]/login/page.tsx`**

```tsx
// app/[lang]/login/page.tsx
import { signIn } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'
import { lang } from 'next/root-params'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const t = await getDictionary()
  const locale = (await lang()) === 'en' ? 'en' : 'bn'
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <Card>
        <h1 className="font-display text-2xl font-semibold">{t.login.heading}</h1>
        {error && <p className="mt-3 rounded-lg bg-bad/10 p-3 text-sm text-bad">{error}</p>}
        <form action={signIn} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="next" value={next ?? withLocale('/plan', locale)} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t.login.email}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t.login.password}</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit">{t.login.button}</Button>
        </form>
        <p className="mt-4 text-sm text-ink-muted">
          {t.login.noAccount}
          <a href={withLocale('/signup', locale)} className="text-accent">
            {t.login.signupLink}
          </a>
        </p>
      </Card>
    </main>
  )
}
```

- [ ] **Step 4: Update `app/[lang]/signup/page.tsx`**

```tsx
// app/[lang]/signup/page.tsx
import { signUp } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'
import { lang } from 'next/root-params'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const t = await getDictionary()
  const locale = (await lang()) === 'en' ? 'en' : 'bn'
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <Card>
        <h1 className="font-display text-2xl font-semibold">{t.signup.heading}</h1>
        {error && <p className="mt-3 rounded-lg bg-bad/10 p-3 text-sm text-bad">{error}</p>}
        <form action={signUp} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t.signup.name}</Label>
            <Input id="name" name="name" type="text" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t.signup.email}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t.signup.password}</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <Button type="submit">{t.signup.button}</Button>
        </form>
        <p className="mt-4 text-sm text-ink-muted">
          {t.signup.haveAccount}
          <a href={withLocale('/login', locale)} className="text-accent">
            {t.signup.loginLink}
          </a>
        </p>
      </Card>
    </main>
  )
}
```

- [ ] **Step 5: Update `app/[lang]/signup/check-email/page.tsx`**

The original file used `next/link`'s `Link` (not a plain `<a>`) for its login link — keep that.

```tsx
// app/[lang]/signup/check-email/page.tsx
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'
import { lang } from 'next/root-params'

export default async function CheckEmailPage() {
  const t = await getDictionary()
  const locale = (await lang()) === 'en' ? 'en' : 'bn'
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <Card>
        <Mail size={24} className="text-accent" />
        <h1 className="mt-3 font-display text-2xl font-semibold">{t.checkEmail.heading}</h1>
        <p className="mt-3 font-bengali text-sm text-ink-muted">{t.checkEmail.body}</p>
        <p className="mt-4 text-sm text-ink-muted">
          {t.checkEmail.done}
          <Link href={withLocale('/login', locale)} className="text-accent">
            {t.checkEmail.loginLink}
          </Link>
        </p>
      </Card>
    </main>
  )
}
```

(`login/page.tsx` and `signup/page.tsx` genuinely used plain `<a>` tags in the original source — those two keep `<a>` as written in Steps 3–4. Only this file's original used `Link`.)

- [ ] **Step 6: Run the full test suite**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 7: Run the build**

Run: `npm run build`
Expected: builds, generating all 14 routes under both `/` and `/en`

- [ ] **Step 8: Commit**

```bash
git add "app/[lang]/translate" "app/[lang]/login" "app/[lang]/signup" components/translate
git commit -m "feat(i18n): translate the translator, login, signup, and check-email pages"
```

---

### Task 14: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full test suite**

Run: `npm test -- --run`
Expected: every test file passes, including all files modified/added across Tasks 1–13

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: clean build, all 14 routes generated for both locales (28 total static/dynamic route entries between `/` and `/en` trees)

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors, no warnings

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, then in a browser (or via the Playwright MCP tool):
- Visit `/` — confirm Bangla script throughout (nav, heading, buttons), no leftover Banglish/English strings from the files touched in this plan.
- Click the locale toggle — confirm URL becomes `/en`, all copy switches to English, nav/toggle/theme-toggle all render correctly.
- Visit `/en/vocab`, `/en/grammar`, `/en/practice`, `/en/translate` — confirm each renders in English with no console hydration errors.
- Log in, visit `/plan` and `/en/plan` — confirm the plan page and its "Day N" heading render correctly in both locales, and toggling a task checkbox still works (revalidation intact).
- Visit `/signup` and `/en/signup` — confirm the "Naam"/"Name" field is present and validation error messages appear in the correct language when submitted empty.

- [ ] **Step 5: Commit** (only if Step 4 surfaces a fix — otherwise this task produces no commit)

```bash
git add -A
git commit -m "fix(i18n): address issues found in final bilingual UI smoke test"
```
