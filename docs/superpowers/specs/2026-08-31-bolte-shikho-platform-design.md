# Bolte Shikho — Platform Design

Date: 2026-08-31
Status: Approved (pending implementation plan)

## Overview

"Bolte Shikho" (বলতে শিখো — "learn to speak") is a spoken-English learning
platform for a Bangla-speaking beginner. It replaces a single static HTML
prototype (built earlier as a Claude artifact, see `english-vocab.html` in
the unrelated `hris` project directory — not reused as code, only as a
content/feature reference) with a proper dynamic, multi-user website.

This is a brand-new, standalone project. It lives in its own directory and
git repository, has no dependency on and no effect on the existing `hris`
project (a separate HR Information System with its own frontend/backend).

## Goals

- Recreate and extend the prototype's learning content (vocabulary,
  grammar/tense lessons, practice tools) as a real website.
- Add user accounts so a learner's progress (30-day plan, score, streak)
  persists across devices instead of living only in one browser's
  localStorage.
- Add a bidirectional English↔Bangla translator (not possible in the
  sandboxed artifact because it could not call external APIs).
- Present all of this with a premium, "gorgeous" visual design — not a
  bare-bones utility page.

## Out of scope (v1)

- Social features (following other learners, leaderboards).
- Payment/subscription.
- Native mobile app (the site must be responsive/mobile-friendly instead).
- Admin CMS for editing vocab/grammar content — content ships as static
  data in the codebase and is edited by hand for now.

## Tech Stack

- **Next.js** (App Router, TypeScript) — both frontend (pages, UI) and
  backend (Route Handlers / Server Actions) live in this one app.
- **Tailwind CSS** — styling.
- **shadcn/ui** (Radix primitives + Tailwind) — accessible base components
  (buttons, dialogs, forms, tabs) styled to match the custom design system
  below, not used with its default look.
- **Framer Motion** — scroll reveals, hover micro-interactions, page
  transitions, animated progress ring/calendar heatmap.
- **Supabase** — Auth (email/password) and Postgres database for
  user-specific state.
- Deployment target: Vercel (not required for v1 completion, but the app
  must be deployable there without extra work).

## Authentication

- Supabase Auth, email/password only for v1 (no OAuth providers yet).
- Custom-built signup/login/logout forms styled with Tailwind + shadcn/ui
  form primitives — not Supabase's prebuilt Auth UI widget.
- Session handling via `@supabase/ssr`, following the standard Next.js
  App Router pattern (server client for Server Components/Route Handlers,
  browser client for client components).
- Vocabulary and grammar pages are publicly viewable without login.
  Practice, Plan/Score, and Translator history require a logged-in user.
- Unauthenticated users hitting `/plan` or trying to save practice
  progress are redirected to `/login` with a return-path.

## Data Model (Supabase / Postgres)

Content (vocab lists, grammar steps, conversation dialogues, the 30-day
plan's task text) stays as static TypeScript/JSON data in the codebase —
it doesn't vary per user and doesn't need a database round-trip.

Only user-specific state is persisted:

```sql
-- one row per authenticated user, created on first sign-in
profiles (
  id            uuid primary key references auth.users(id),
  display_name  text,
  created_at    timestamptz default now()
)

-- one row per (user, plan_day, task_index)
plan_task_progress (
  id            bigint generated always as identity primary key,
  user_id       uuid references auth.users(id),
  plan_day      int not null,        -- 1..30
  task_index    int not null,        -- index within that day's task list
  completed_at  timestamptz,         -- null = not done
  unique (user_id, plan_day, task_index)
)

-- one row per (user, plan_day), set once all that day's tasks are done
plan_day_completion (
  user_id        uuid references auth.users(id),
  plan_day       int not null,
  scheduled_date date not null,      -- plan_start_date + (plan_day - 1)
  completed_date date not null,      -- real calendar date it was finished
  primary key (user_id, plan_day)
)

-- one row per user, set when they click "Start" on the 30-day plan
plan_start (
  user_id     uuid primary key references auth.users(id),
  start_date  date not null
)

-- daily practice streak (separate from the 30-day plan — the free-form
-- "I practiced today" button from the prototype)
practice_log (
  user_id  uuid references auth.users(id),
  log_date date not null,
  primary key (user_id, log_date)
)
```

Row Level Security: every table restricts reads/writes to
`auth.uid() = user_id` (or `= id` for `profiles`).

Score and streak numbers are *derived* from these tables at read time
(same logic as the prototype: 10 pts/task, +20 for a fully completed day,
+10 if completed on/before its scheduled date), not stored as a separate
mutable "score" column, so they can never drift out of sync with the raw
completion data.

## Pages / Routes

- `/` — Landing/home page (hero, feature highlights, CTA to sign up).
- `/vocab` — Word categories, search, audio pronunciation (🔊), speed
  toggle, quiz mode. Public.
- `/grammar` — All grammar steps (tenses through comparative/superlative,
  time, possessive, past continuous). Public.
- `/practice` — Daily writing prompt generator, mic-based pronunciation
  self-check, conversation-practice dialogues, listening resource list.
  Requires login to persist the practice streak.
- `/plan` — 30-day plan: start button (records real start date), daily
  checklist, score, calendar heatmap of on-time/late/missed days.
  Requires login.
- `/translate` — English↔Bangla translator: text input either direction,
  mic input, 🔊 audio output of the result.
- `/login`, `/signup` — Auth forms.

## Translator

- A Next.js Route Handler at `/api/translate` accepts `{ text, from, to }`
  and calls the **MyMemory Translation API** server-side (free, no API
  key, generous enough for personal use). Chosen over Google Cloud
  Translate to avoid requiring the user to set up billing/API keys; the
  route is a thin wrapper so the provider can be swapped later without
  touching the frontend.
- Frontend: a two-pane translator UI (source/target language swap
  button), a mic button (Web Speech API `SpeechRecognition`) to dictate
  the source text, and a 🔊 button (`speechSynthesis`) to hear the
  result read aloud.
- Translation results are not stored server-side; this feature has no
  database table.

## Visual Design System

- **Palette:** deep navy-indigo base (dark, ~`#0F1729`) with a warm
  gold/amber accent (~`#E8A94D`); soft cream/off-white surface tone for
  light mode. Full light/dark theme support with a toggle.
- **Typography:** a characterful serif display face (Fraunces or
  Instrument Serif) for hero headings and marketing-style copy; a clean
  sans (Inter or Work Sans) for body/UI text; Hind Siliguri for all
  Bangla text, matched in weight/scale to the Latin faces.
- **Layout:** real landing page (hero, feature cards, illustration or
  animated visual), card-based UI elsewhere with soft shadows and subtle
  glassmorphism accents; rounded but not generically `rounded-lg`
  everywhere — a deliberate shape language.
- **Motion:** Framer Motion for scroll-triggered reveals, hover
  micro-interactions, and an animated progress ring / calendar heatmap on
  `/plan`. Respect `prefers-reduced-motion`.
- **Components:** shadcn/ui primitives (button, dialog, tabs, form,
  checkbox) re-themed to the palette/type above rather than used with
  their default shadcn look.

## Project Structure

New, standalone directory and git repository:

```
/home/iqbal/Project/bolte-shikho/
  app/                (Next.js App Router pages + route handlers)
  components/
  lib/                (Supabase clients, translation client, scoring logic)
  data/               (static vocab/grammar/plan content)
  docs/superpowers/specs/   (this file)
```

No files in `/home/iqbal/Project/hris/` are read, imported, or modified by
this project.

## Success Criteria

- A new user can sign up, log in, browse vocab/grammar, start the 30-day
  plan, check off a day's tasks, and see their score/streak persist after
  logging out and back in (or on a different device).
- The translator accepts free-form text in either language, returns a
  translation, and can both take mic input and speak the result aloud.
- The site renders correctly and readably in both light and dark mode and
  on mobile-width screens.
- `hris` project is untouched — verified by not having modified any file
  under `/home/iqbal/Project/hris/` during this work.
