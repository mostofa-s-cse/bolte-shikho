# Bilingual UI (Bangla/English switch) — Design

Date: 2026-08-31
Status: Approved (pending implementation plan)

## Overview

Bolte Shikho's UI copy is currently a hardcoded mix of English and Banglish
(romanized Bangla, e.g. "Shobdo", "Bakko o Tense") scattered inline across
every page component. This adds a real bilingual UI: Bangla (real Bangla
script, default) and English, switchable at any time via a toggle in the
header, with the choice reflected in the URL.

## Goals

- Every piece of UI chrome and page copy (nav labels, headings,
  descriptions, button text, placeholders, form labels, error/empty
  states) is available in both real Bangla script and proper English.
- Bangla is the default; visiting the site with no language marker shows
  Bangla with no URL prefix (`/vocab`). Switching to English prefixes the
  URL (`/en/vocab`). Switching back drops the prefix.
- A visible toggle (next to the existing theme toggle in the header)
  switches language from any page, landing on the equivalent page in the
  other language.
- The choice is remembered (cookie) so internal navigation stays in the
  chosen language without re-detecting on every request.

## Out of scope

- The vocabulary/grammar/dialogue/prompt **data** (`data/*.ts`) — these
  already carry their own bilingual fields (`en`/`pron`/`mean`, English +
  Bangla example sentences, etc.) for pedagogical reasons and are not
  touched by this feature at all.
- Any language beyond Bangla and English.
- Locale-aware date/number formatting — the app has no such formatting
  today (dates are already handled explicitly as ISO strings in
  `lib/scoring.ts`).
- Third-party i18n libraries (`next-intl` etc.) — this Next.js build
  (16.3.3) uses the newly-renamed `proxy.ts` convention and ships
  `next/root-params` specifically to support this pattern natively (see
  `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`).
  Pulling in a third-party library risks version incompatibility with
  APIs this new; the native pattern is also a better fit for an app this
  size (14 routes, 2 locales, no pluralization/ICU needs).

## Routing

All user-facing pages move under `app/[lang]/...`:

```
app/[lang]/layout.tsx        (was app/layout.tsx)
app/[lang]/page.tsx          (was app/page.tsx)
app/[lang]/vocab/page.tsx
app/[lang]/grammar/page.tsx
app/[lang]/practice/page.tsx
app/[lang]/plan/page.tsx
app/[lang]/translate/page.tsx
app/[lang]/login/page.tsx
app/[lang]/signup/page.tsx
app/[lang]/signup/check-email/page.tsx
```

Route Handlers stay outside `[lang]` (no UI concept, no localized copy):

```
app/api/translate/route.ts
app/auth/confirm/route.ts
```

`app/[lang]/layout.tsx` becomes the actual root layout (contains
`<html>`/`<body>`, per this Next.js version's own documented pattern),
setting `<html lang={lang === 'bn' ? 'bn' : 'en'}>`.

`locales = ['bn', 'en']`, `defaultLocale = 'bn'`. `proxy.ts` (renamed from
`middleware.ts` — the file convention this project is currently using is
deprecated, and this feature is touching the file anyway, so the rename
per `npx @next/codemod@canary middleware-to-proxy .` happens as part of
this work):

- If the incoming pathname has no locale prefix (`/vocab`, `/`), rewrite
  it internally to `/bn/...` (URL bar stays unprefixed) and set a
  `NEXT_LOCALE=bn` cookie.
- If it's already prefixed (`/en/...`), pass through and set
  `NEXT_LOCALE=en`.
- This runs chained with the existing Supabase `updateSession` auth
  check (session-cookie refresh + `/plan` protection) — both concerns
  live in the same `proxy.ts`, locale rewrite composed with the existing
  auth response rather than replacing it.

`generateStaticParams` on the root layout returns both locales.

## Content

Two dictionary files:

```
dictionaries/bn.json   -- real Bangla script
dictionaries/en.json   -- proper English
```

Keyed by page/section, e.g.:

```json
{
  "nav": { "vocab": "শব্দ", "grammar": "বাক্য ও টেন্স", "practice": "অনুশীলন", "plan": "৩০ দিনের পরিকল্পনা", "translate": "অনুবাদ" },
  "header": { "login": "লগইন", "logout": "লগআউট" },
  "home": { "heading": "...", "sub": "...", "cta": "..." },
  "vocab": { "heading": "শব্দ", "description": "...", "searchPlaceholder": "..." }
}
```

`en.json` mirrors the same key shape with English strings. A type
(`type Dictionary = typeof import('../dictionaries/bn.json')`) keeps both
files structurally in sync at compile time — a key present in one but
missing in the other is a type error.

## Access pattern

- **Server Components** (all pages, `SiteHeader`): a `getDictionary()`
  helper in `lib/i18n/dictionaries.ts` reads the locale via
  `next/root-params` (`lang()`), so no prop drilling is needed through
  Server Component trees.
- **Client Components** (`VocabBrowser`, `PromptCard`,
  `PronunciationCheck`, `MobileNav`, `TranslatorForm`, `ThemeToggle`, and
  others already marked `'use client'`): `next/root-params` doesn't work
  here. `app/[lang]/layout.tsx` computes the dictionary once (Server
  Component) and passes it into a `LocaleProvider` Client Component that
  exposes it via React Context; a `useTranslations()` hook reads from
  that context.
- **Server Actions** (`app/auth/actions.ts`): `next/root-params` doesn't
  work here either. Actions read the `NEXT_LOCALE` cookie via
  `cookies()` (`next/headers`) to build locale-correct redirect targets
  (`/plan` for bn, `/en/plan` for en; same for `/signup?error=...` etc).

## Switcher UI

A small Client Component (`components/locale-toggle.tsx`) placed next to
`ThemeToggle` in `SiteHeader`. Uses `usePathname()` to compute the
equivalent path under the other locale (strip/add the `/en` prefix,
preserving the rest of the path and any query string) and navigates
there with `next/link` or `router.push`.

## Testing

- Existing component tests that render client components needing
  translated strings get wrapped in a test `LocaleProvider` (a small test
  helper, one dictionary fixture is enough — assertions target structure/
  behavior, not exact translated text, matching current test style).
- New unit tests: `getDictionary()` resolves the right file per locale
  and 404s (via `notFound()`) on an unknown locale; `proxy.ts`'s
  locale-rewrite branch (default-locale rewrite vs. prefixed pass-
  through) using `next/experimental/testing/server`'s
  `unstable_doesProxyMatch`/rewrite helpers, chained correctly with the
  existing auth-redirect test coverage.
- `npm run build` must succeed with `generateStaticParams` producing both
  `/`(bn) and `/en` route trees.

## Migration scope (for the implementation plan to size into tasks)

- ~9 page files moved under `app/[lang]/` and wired to `getDictionary()`.
- `dictionaries/bn.json` + `dictionaries/en.json` written from scratch
  (real Bangla script + English) covering every UI string currently
  hardcoded in those 9 pages plus `SiteHeader`, `MobileNav`,
  `ThemeToggle`, and the client components listed above.
- `proxy.ts` rewritten (rename + locale rewrite + existing auth logic
  merged).
- New `lib/i18n/dictionaries.ts`, `lib/i18n/locale-context.tsx`,
  `components/locale-toggle.tsx`.
- `app/auth/actions.ts` redirects made locale-aware via the
  `NEXT_LOCALE` cookie.
- Existing component tests updated for the new context wrapper where
  needed.
