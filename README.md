# Bolte Shikho

Spoken-English learning platform for Bangla speakers — vocabulary, grammar,
pronunciation practice, a 30-day plan with scoring, and an English↔Bangla
translator.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase
   project URL and anon key.
3. In the Supabase SQL Editor, run `supabase/schema.sql`.
4. `npm run dev` and open http://localhost:3000

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm test` — run the Vitest suite once
- `npm run test:watch` — run tests in watch mode

## Project layout

See `docs/superpowers/specs/2026-08-31-bolte-shikho-platform-design.md` for
the full design, and `docs/superpowers/plans/2026-08-31-bolte-shikho-platform.md`
for the implementation plan this was built from.
