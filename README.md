# Bolte Shikho

Spoken-English learning platform for Bangla speakers — vocabulary, grammar,
pronunciation practice, a 30-day plan with scoring, and an English↔Bangla
translator.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase
   project URL and anon key.
3. In the Supabase SQL Editor, run `supabase/schema.sql`.
4. In Authentication → Settings, note whether "Confirm email" is enabled
   (it is on by default for new projects). If enabled, signup does not create
   a session — users are sent to `/signup/check-email` and must click the
   emailed link (handled by `/auth/confirm`) before they can log in. Add
   `http://localhost:3000/**` to the allowed redirect URLs so that link works
   in development.
5. `npm run dev` and open http://localhost:3000

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm test` — run the Vitest suite once
- `npm run test:watch` — run tests in watch mode

## Project layout

See `docs/superpowers/specs/2026-08-31-bolte-shikho-platform-design.md` for
the full design, and `docs/superpowers/plans/2026-08-31-bolte-shikho-platform.md`
for the implementation plan this was built from.
