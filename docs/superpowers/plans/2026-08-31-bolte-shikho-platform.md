# Bolte Shikho Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Bolte Shikho", a Next.js + Supabase spoken-English learning website (vocab, grammar, practice tools, a 30-day plan with score tracking, and an English↔Bangla translator) with user accounts and a premium visual design.

**Architecture:** A single Next.js (App Router, TypeScript) app serves both frontend and backend — pages render UI, Route Handlers/Server Actions talk to Supabase (Auth + Postgres) for user-specific state, and a Route Handler proxies the free MyMemory API for translation. Learning content (vocab, grammar, plan tasks, dialogues) ships as static TypeScript data, not database rows.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, hand-authored shadcn/ui-style components (button, card, tabs, dialog, checkbox, input, label) built on `class-variance-authority` + `clsx`/`tailwind-merge`, Framer Motion, `next-themes`, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-31-bolte-shikho-platform-design.md`

## Global Constraints

- Project root is `/home/iqbal/Project/bolte-shikho/` — never read or write any file under `/home/iqbal/Project/hris/`.
- Next.js App Router + TypeScript for everything; no separate backend service — Supabase is the only external backend dependency.
- All styling via Tailwind CSS; components follow the shadcn/ui pattern but are hand-authored and re-themed, not left in a default/generic look.
- Palette: deep navy-indigo base (`#0F1729` family) + warm gold/amber accent (`#E8A94D` family) + soft cream surface for light mode. Full light/dark theme support, toggle-able, must not hard-code colors outside the token system.
- Typography: Fraunces (serif display) for headings/hero copy, Work Sans (sans) for body/UI, Hind Siliguri for all Bangla text — loaded via `next/font/google`.
- Framer Motion for scroll reveals / hover micro-interactions / the plan calendar; respect `prefers-reduced-motion`.
- Auth: Supabase email/password only for v1, via `@supabase/ssr`. Vocab/Grammar/Translator are public; Practice streak and the 30-Day Plan require a signed-in user.
- Vocab, grammar, 30-day plan tasks, and dialogues are static data in `data/`, never fetched from Supabase.
- Translator calls the free MyMemory API (no key) from a server-side Route Handler — never call it directly from the browser.
- Score/streak numbers are always derived at read time from raw completion rows (never stored as a separately-mutable counter).

---

## File Structure

```
bolte-shikho/
  app/
    layout.tsx                      Root layout: fonts, ThemeProvider, header
    globals.css                     Tailwind + design tokens (light/dark)
    page.tsx                        Landing page
    login/page.tsx
    signup/page.tsx
    vocab/page.tsx
    grammar/page.tsx
    practice/page.tsx
    plan/page.tsx
    translate/page.tsx
    api/translate/route.ts
    auth/actions.ts                 Server Actions: signUp, signIn, signOut
    practice/actions.ts             Server Action: logPracticeToday
    plan/actions.ts                 Server Actions: startPlan, toggleTask
  components/
    ui/button.tsx
    ui/card.tsx
    ui/tabs.tsx
    ui/checkbox.tsx
    ui/input.tsx
    ui/label.tsx
    site-header.tsx
    theme-toggle.tsx
    theme-provider.tsx
    vocab/word-card.tsx
    vocab/category-chips.tsx
    vocab/vocab-browser.tsx
    grammar/grammar-steps.tsx
    practice/prompt-card.tsx
    practice/pronunciation-check.tsx
    practice/dialogue-list.tsx
    practice/practice-streak.tsx
    plan/plan-calendar.tsx
    plan/plan-task-list.tsx
    plan/plan-score-card.tsx
    plan/plan-start-card.tsx
    translate/translator-form.tsx
  lib/
    utils.ts                        cn() class-merge helper
    speech.ts                       speak(), recognition helpers, normalizeSpeech()
    scoring.ts                      Pure plan/score/date logic
    supabase/client.ts               Browser Supabase client
    supabase/server.ts               Server Supabase client
    supabase/middleware.ts           Session-refresh helper used by middleware.ts
  data/
    vocab.ts
    grammar.ts
    plan-tasks.ts
    dialogues.ts
    prompts.ts
  supabase/
    schema.sql
  scripts/
    migrate-content.mjs             One-time vocab/plan/prompt migration from the prototype
  middleware.ts
  vitest.config.ts
  vitest.setup.ts
  .env.local.example
  README.md
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts` (or `.mjs` — whatever `create-next-app`'s current version emits), `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css` (exact filenames are whatever `create-next-app --tailwind` currently emits — Tailwind v4, the current default, produces no separate `tailwind.config.ts`; Task 2 configures Tailwind entirely from `app/globals.css`)
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Test: `lib/sanity.test.ts`

**Interfaces:**
- Produces: a running `npm run dev` Next.js app and a working `npm test` (Vitest) command that every later task's tests rely on.

- [ ] **Step 1: Scaffold the Next.js app**

Run from `/home/iqbal/Project/bolte-shikho`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm
```

When prompted, accept defaults (React 19, no `src/` directory, Turbopack default is fine).

- [ ] **Step 2: Install the remaining dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr framer-motion next-themes clsx tailwind-merge class-variance-authority lucide-react
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

Add to `package.json` `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write a sanity test**

Create `lib/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('project setup', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run the test suite and dev server**

Run: `npm test`
Expected: 1 test file, 1 test passed.

Run: `npm run dev` and open `http://localhost:3000` — the default Next.js starter page loads without errors. Stop the dev server (Ctrl+C) once confirmed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Tailwind and Vitest"
```

---

### Task 2: Design Tokens (Fonts, Colors, Light/Dark Theme)

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`
- No `tailwind.config.ts` — Task 1 scaffolded Tailwind v4, which is
  configured entirely from CSS (`@theme` in `app/globals.css`) rather than a
  JS/TS config file. `postcss.config.mjs` (already set up by Task 1's
  `create-next-app --tailwind`) stays untouched.

**Interfaces:**
- Produces: Tailwind color utilities (`bg-surface`, `text-ink`, `bg-accent`, etc.) and font utilities (`font-display`, `font-sans`, `font-bengali`) every later component uses, generated by Tailwind v4 from the `@theme` block below. Dark mode via a `.dark` class (`dark:` variants), toggled by `next-themes`.

- [ ] **Step 1: Load fonts in the root layout**

Replace the contents of `app/layout.tsx`. Note the font loader `variable` names end in `-raw` — this is deliberate so Task 2 Step 2's `@theme` block can reference them while defining the actual `--font-display` / `--font-sans` / `--font-bengali` theme keys with their own fallback stacks, without a circular self-reference:

```tsx
import type { Metadata } from 'next'
import { Fraunces, Work_Sans, Hind_Siliguri } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fraunces.variable} ${workSans.variable} ${hindSiliguri.variable} font-sans bg-surface text-ink antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Define color and font tokens, and dark-mode overrides, in `app/globals.css`**

Replace the contents of `app/globals.css` (Tailwind v4's CSS-first config — no `tailwind.config.ts` file exists in this project):

```css
@import 'tailwindcss';

/* Makes `dark:` variants respond to a `.dark` class on an ancestor
   (added by next-themes with attribute="class"), not just OS preference. */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-display: var(--font-display-raw), Georgia, serif;
  --font-sans: var(--font-sans-raw), system-ui, sans-serif;
  --font-bengali: var(--font-bengali-raw), 'Noto Sans Bengali', sans-serif;

  --color-surface: #faf9f6;
  --color-surface-alt: #ede9e0;
  --color-ink: #181b24;
  --color-ink-muted: #606575;
  --color-accent: #e8a94d;
  --color-accent-ink: #2e1e04;
  --color-border: #e0dbd0;
  --color-good: #2e7d4f;
  --color-bad: #b23b3b;
}

.dark {
  --color-surface: #0f1729;
  --color-surface-alt: #182136;
  --color-ink: #e8e6de;
  --color-ink-muted: #9aa0ac;
  --color-accent: #e8a94d;
  --color-accent-ink: #1b1200;
  --color-border: #2d374f;
  --color-good: #4fbe7c;
  --color-bad: #e06868;
}

[lang='bn'] {
  font-family: var(--font-bengali);
}
```

Because `--color-*` and `--font-*` are declared inside `@theme`, Tailwind v4 automatically generates the matching utilities (`bg-surface`, `text-ink-muted`, `border-border`, `font-display`, etc.) — there is no separate step to register them. The `.dark { ... }` block re-declares the same custom properties with dark-mode values; since Tailwind's generated utilities reference `var(--color-surface)` etc. at the CSS level, they automatically pick up whichever value is in scope.

- [ ] **Step 3: Create the theme provider wrapper**

Create `components/theme-provider.tsx`:

```tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

- [ ] **Step 4: Create a placeholder site header (fleshed out in Task 12) so the layout compiles**

Create `components/site-header.tsx`:

```tsx
export function SiteHeader() {
  return (
    <header className="border-b border-border px-6 py-4">
      <span className="font-display text-lg font-semibold">Bolte Shikho</span>
    </header>
  )
}
```

- [ ] **Step 5: Verify visually**

Run: `npm run dev`, open `http://localhost:3000`. Confirm the page background/text use the new tokens (no visual crash) and toggling the OS dark mode setting changes the background color.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: design tokens, fonts, and theme provider"
```

---

### Task 3: Base UI Components (button, card, tabs, checkbox, input, label)

**Files:**
- Create: `lib/utils.ts`
- Create: `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/tabs.tsx`, `components/ui/checkbox.tsx`, `components/ui/input.tsx`, `components/ui/label.tsx`
- Test: `components/ui/button.test.tsx`

**Interfaces:**
- Produces: `cn(...)` from `lib/utils.ts`; `<Button variant="primary" | "ghost">`, `<Card>`, `<Tabs>`/`<TabsList>`/`<TabsTrigger>`/`<TabsContent>`, `<Checkbox>`, `<Input>`, `<Label>` — used by every page task below.

- [ ] **Step 1: Create the class-merge helper**

Create `lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Write the failing test for Button**

Create `components/ui/button.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders children and applies the primary variant by default', () => {
    render(<Button>Shuru Koro</Button>)
    const button = screen.getByRole('button', { name: 'Shuru Koro' })
    expect(button).toBeInTheDocument()
    expect(button.className).toContain('bg-accent')
  })

  it('applies the ghost variant when requested', () => {
    render(<Button variant="ghost">Cancel</Button>)
    const button = screen.getByRole('button', { name: 'Cancel' })
    expect(button.className).not.toContain('bg-accent')
  })
})
```

- [ ] **Step 2b: Run test to verify it fails**

Run: `npm test -- button`
Expected: FAIL — `./button` module not found.

- [ ] **Step 3: Implement Button**

Create `components/ui/button.tsx`:

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-ink hover:brightness-95',
        ghost: 'bg-surface border border-border text-ink hover:border-accent hover:text-accent',
      },
      size: {
        default: 'h-10 px-5 text-sm',
        sm: 'h-8 px-4 text-xs',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
)
Button.displayName = 'Button'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- button`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement the remaining static UI components (no separate tests — thin wrappers, exercised by later component tests)**

Create `components/ui/card.tsx`:

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-surface p-5 shadow-sm', className)}
      {...props}
    />
  )
}
```

Create `components/ui/input.tsx`:

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
```

Create `components/ui/label.tsx`:

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm font-medium text-ink', className)} {...props} />
}
```

Create `components/ui/checkbox.tsx`:

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn('h-[18px] w-[18px] accent-accent', className)}
      {...props}
    />
  )
)
Checkbox.displayName = 'Checkbox'
```

Create `components/ui/tabs.tsx`:

```tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  setValue: (value: string) => void
}
const TabsContext = React.createContext<TabsContextValue | null>(null)

export function Tabs({
  defaultValue,
  children,
  className,
}: {
  defaultValue: string
  children: React.ReactNode
  className?: string
}) {
  const [value, setValue] = React.useState(defaultValue)
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap gap-2', className)}>{children}</div>
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('TabsTrigger must be used inside Tabs')
  const active = ctx.value === value
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
        active
          ? 'border-accent bg-accent text-accent-ink'
          : 'border-border bg-surface text-ink-muted hover:text-ink'
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('TabsContent must be used inside Tabs')
  if (ctx.value !== value) return null
  return <div>{children}</div>
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: base UI components (button, card, tabs, checkbox, input, label)"
```

---

### Task 4: Speech Utilities (`lib/speech.ts`)

**Files:**
- Create: `lib/speech.ts`
- Test: `lib/speech.test.ts`

**Interfaces:**
- Produces: `speak(text: string, rate?: number): void`, `normalizeSpeech(text: string): string`, `isSpeechRecognitionSupported(): boolean`, `createRecognition(): SpeechRecognitionLike | null`. Used by Tasks 13, 14, 15, 17.

- [ ] **Step 1: Write the failing tests**

Create `lib/speech.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { speak, normalizeSpeech, isSpeechRecognitionSupported } from './speech'

describe('normalizeSpeech', () => {
  it('lowercases, strips punctuation, and collapses whitespace', () => {
    expect(normalizeSpeech("Do you go to school?")).toBe('do you go to school')
    expect(normalizeSpeech("I don't know.")).toBe("i don't know")
    expect(normalizeSpeech('  Hello   World  ')).toBe('hello world')
  })
})

describe('speak', () => {
  beforeEach(() => {
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak: vi.fn() })
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      // Must be a real `function`, not an arrow function — arrow functions
      // are never constructible, and `speak()` calls this with `new`.
      vi.fn(function (this: { text: string; lang: string; rate: number }, text: string) {
        this.text = text
        this.lang = ''
        this.rate = 1
      })
    )
  })

  it('strips parenthetical asides and speaker labels before speaking', () => {
    speak('A: I go to school (Present tense).', 1)
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1)
    const utterance = (window.SpeechSynthesisUtterance as any).mock.results[0].value
    expect(utterance.text).toBe('I go to school.')
  })

  it('does nothing when speechSynthesis is unavailable', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    expect(() => speak('hello')).not.toThrow()
  })
})

describe('isSpeechRecognitionSupported', () => {
  it('returns false when neither global is present', () => {
    vi.stubGlobal('SpeechRecognition', undefined)
    vi.stubGlobal('webkitSpeechRecognition', undefined)
    expect(isSpeechRecognitionSupported()).toBe(false)
  })

  it('returns true when webkitSpeechRecognition is present', () => {
    vi.stubGlobal('webkitSpeechRecognition', function () {})
    expect(isSpeechRecognitionSupported()).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- speech`
Expected: FAIL — `./speech` module not found.

- [ ] **Step 3: Implement `lib/speech.ts`**

```ts
export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z' ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function speak(text: string, rate = 1): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) {
    return
  }
  window.speechSynthesis.cancel()
  const clean = text
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/^[AB]:\s*/, '')
    .trim()
  const utterance = new SpeechSynthesisUtterance(clean)
  utterance.lang = 'en-US'
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

export function createRecognition(): SpeechRecognition | null {
  if (typeof window === 'undefined') return null
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SR) return null
  const recognition = new SR() as SpeechRecognition
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  return recognition
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- speech`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: speech synthesis/recognition utilities"
```

---

### Task 5: Plan Scoring Logic (`lib/scoring.ts`)

**Files:**
- Create: `lib/scoring.ts`
- Test: `lib/scoring.test.ts`

**Interfaces:**
- Produces: `dateFromStartOffset(startDate: string, offsetDays: number): string`, `getCurrentPlanDay(startDate: string, totalDays: number, today: string): number`, `type DayStatus = 'future' | 'partial' | 'missed' | 'done-ontime' | 'done-late'`, `computeDayStatus(params): DayStatus`, `computeScore(days): { score: number; doneOnTime: number }`. Used by Task 16 (`/plan`) to turn Supabase rows into UI state without any DB-coupled logic.

- [ ] **Step 1: Write the failing tests**

Create `lib/scoring.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { dateFromStartOffset, getCurrentPlanDay, computeDayStatus, computeScore } from './scoring'

describe('dateFromStartOffset', () => {
  it('adds the offset in days to the start date', () => {
    expect(dateFromStartOffset('2026-08-30', 0)).toBe('2026-08-30')
    expect(dateFromStartOffset('2026-08-30', 1)).toBe('2026-08-31')
    expect(dateFromStartOffset('2026-08-30', 29)).toBe('2026-09-28')
  })
})

describe('getCurrentPlanDay', () => {
  it('is day 1 on the start date', () => {
    expect(getCurrentPlanDay('2026-08-30', 30, '2026-08-30')).toBe(1)
  })
  it('advances one day per calendar day', () => {
    expect(getCurrentPlanDay('2026-08-30', 30, '2026-09-02')).toBe(4)
  })
  it('clamps at the total day count', () => {
    expect(getCurrentPlanDay('2026-08-30', 30, '2027-01-01')).toBe(30)
  })
})

describe('computeDayStatus', () => {
  const base = { startDate: '2026-08-30', dayNumber: 1, taskCount: 4 }

  it('is "future" for a day that has not arrived yet', () => {
    expect(
      computeDayStatus({ ...base, dayNumber: 5, checkedCount: 0, completedDate: null, today: '2026-08-30' })
    ).toBe('future')
  })

  it('is "missed" for a past day with nothing checked', () => {
    expect(
      computeDayStatus({ ...base, checkedCount: 0, completedDate: null, today: '2026-09-05' })
    ).toBe('missed')
  })

  it('is "partial" for a past day with some tasks checked', () => {
    expect(
      computeDayStatus({ ...base, checkedCount: 2, completedDate: null, today: '2026-09-05' })
    ).toBe('partial')
  })

  it('is "done-ontime" when finished on or before its scheduled date', () => {
    expect(
      computeDayStatus({ ...base, checkedCount: 4, completedDate: '2026-08-30', today: '2026-08-30' })
    ).toBe('done-ontime')
  })

  it('is "done-late" when finished after its scheduled date', () => {
    expect(
      computeDayStatus({ ...base, checkedCount: 4, completedDate: '2026-09-02', today: '2026-09-02' })
    ).toBe('done-late')
  })
})

describe('computeScore', () => {
  it('awards 10 points per checked task', () => {
    const { score } = computeScore([
      { taskCount: 4, checkedCount: 2, scheduledDate: '2026-08-30', completedDate: null },
    ])
    expect(score).toBe(20)
  })

  it('adds a 20-point bonus for a fully completed day', () => {
    const { score } = computeScore([
      { taskCount: 4, checkedCount: 4, scheduledDate: '2026-08-30', completedDate: '2026-09-05' },
    ])
    expect(score).toBe(4 * 10 + 20)
  })

  it('adds a further 10-point bonus and counts it when completed on time', () => {
    const { score, doneOnTime } = computeScore([
      { taskCount: 4, checkedCount: 4, scheduledDate: '2026-08-30', completedDate: '2026-08-30' },
    ])
    expect(score).toBe(4 * 10 + 20 + 10)
    expect(doneOnTime).toBe(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- scoring`
Expected: FAIL — `./scoring` module not found.

- [ ] **Step 3: Implement `lib/scoring.ts`**

```ts
export function dateFromStartOffset(startDate: string, offsetDays: number): string {
  const d = new Date(`${startDate}T00:00:00`)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export function getCurrentPlanDay(startDate: string, totalDays: number, today: string): number {
  const start = new Date(`${startDate}T00:00:00`)
  const now = new Date(`${today}T00:00:00`)
  const diff = Math.floor((now.getTime() - start.getTime()) / 86_400_000) + 1
  return Math.min(Math.max(diff, 1), totalDays)
}

export type DayStatus = 'future' | 'partial' | 'missed' | 'done-ontime' | 'done-late'

export function computeDayStatus(params: {
  startDate: string
  dayNumber: number
  taskCount: number
  checkedCount: number
  completedDate: string | null
  today: string
}): DayStatus {
  const { startDate, dayNumber, taskCount, checkedCount, completedDate, today } = params
  const scheduledDate = dateFromStartOffset(startDate, dayNumber - 1)
  const allDone = taskCount > 0 && checkedCount === taskCount
  if (allDone) {
    return completedDate && completedDate > scheduledDate ? 'done-late' : 'done-ontime'
  }
  if (scheduledDate > today) return 'future'
  if (checkedCount > 0) return 'partial'
  return 'missed'
}

export interface DayScoreInput {
  taskCount: number
  checkedCount: number
  scheduledDate: string
  completedDate: string | null
}

export function computeScore(days: DayScoreInput[]): { score: number; doneOnTime: number } {
  let score = 0
  let doneOnTime = 0
  for (const day of days) {
    score += day.checkedCount * 10
    const allDone = day.taskCount > 0 && day.checkedCount === day.taskCount
    if (allDone) {
      score += 20
      if (day.completedDate && day.completedDate <= day.scheduledDate) {
        score += 10
        doneOnTime++
      }
    }
  }
  return { score, doneOnTime }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- scoring`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: pure plan scoring and date logic"
```

---

### Task 6: Static Vocabulary Data

**Files:**
- Create: `scripts/migrate-content.mjs`, `data/vocab.ts` (generated by the script, then committed as a normal source file)
- Test: `data/vocab.test.ts`

**Interfaces:**
- Produces: `export interface VocabWord { en: string; pron: string; mean: string }`, `export interface VocabCategory { name: string; words: VocabWord[] }`, `export const VOCAB: VocabCategory[]` (30 categories, 307 words). Consumed by Task 13.

The earlier prototype (an HTML file with its vocabulary as a plain JS array, kept for reference only — never imported or modified by this project) already contains this exact data. Rather than hand-retyping ~300 words, Step 3 below is a small one-time migration script that reads that array out of the prototype and writes it as `data/vocab.ts`. The script is run once now; after that, `data/vocab.ts` is a normal committed file and the script/prototype are never touched again by later tasks.

- [ ] **Step 1: Write the failing test**

Create `data/vocab.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { VOCAB } from './vocab'

describe('VOCAB', () => {
  it('has 30 categories', () => {
    expect(VOCAB.length).toBe(30)
  })

  it('has 307 words in total', () => {
    const total = VOCAB.reduce((n, c) => n + c.words.length, 0)
    expect(total).toBe(307)
  })

  it('every category has a name and every word has all three fields', () => {
    for (const category of VOCAB) {
      expect(category.name.length).toBeGreaterThan(0)
      expect(category.words.length).toBeGreaterThan(0)
      for (const word of category.words) {
        expect(word.en.length).toBeGreaterThan(0)
        expect(word.pron.length).toBeGreaterThan(0)
        expect(word.mean.length).toBeGreaterThan(0)
      }
    }
  })

  it('contains the Pronoun category with "I"', () => {
    const pronouns = VOCAB.find((c) => c.name === 'Pronoun')
    expect(pronouns).toBeDefined()
    expect(pronouns!.words.some((w) => w.en === 'I')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- vocab`
Expected: FAIL — `./vocab` module not found.

- [ ] **Step 3: Write and run the migration script**

Create `scripts/migrate-content.mjs`:

```js
#!/usr/bin/env node
// One-time migration: reads the vocabulary array out of the earlier
// prototype (read-only reference, never modified) and writes it as
// data/vocab.ts. Run once; data/vocab.ts is committed normally after that.
import fs from 'node:fs'
import path from 'node:path'

const SOURCE = process.argv[2] || '/home/iqbal/Project/hris/english-vocab.html'
const OUT_DIR = path.resolve('data')

const html = fs.readFileSync(SOURCE, 'utf8')
const script = html.match(/<script>([\s\S]*)<\/script>/)[1]

function extractArray(varName) {
  const re = new RegExp(`const ${varName} = (\\[[\\s\\S]*?\\n  \\]);`)
  const match = script.match(re)
  if (!match) throw new Error(`Could not find "const ${varName} = [...]" in ${SOURCE}`)
  // eslint-disable-next-line no-new-func -- trusted local file, run once at migration time
  return new Function(`return ${match[1]}`)()
}

const DATA = extractArray('DATA')
const vocab = DATA.map(([name, words]) => ({
  name,
  words: words.map(([en, pron, mean]) => ({ en, pron, mean })),
}))

const vocabTs = `export interface VocabWord {
  en: string
  pron: string
  mean: string
}

export interface VocabCategory {
  name: string
  words: VocabWord[]
}

export const VOCAB: VocabCategory[] = ${JSON.stringify(vocab, null, 2)}
`

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(path.join(OUT_DIR, 'vocab.ts'), vocabTs)
console.log(
  `Wrote data/vocab.ts (${vocab.length} categories, ${vocab.reduce((n, c) => n + c.words.length, 0)} words)`
)
```

Run:

```bash
node scripts/migrate-content.mjs
```

Expected output: `Wrote data/vocab.ts (30 categories, 307 words)`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- vocab`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: static vocabulary data (30 categories, migrated from prototype)"
```

---

### Task 7: Static Grammar Data

**Files:**
- Create: `data/grammar.ts`
- Test: `data/grammar.test.ts`

**Interfaces:**
- Produces: `export interface GrammarExample { en: string; pron: string; mean: string }`, `export interface GrammarBlock { structure?: string; tag?: string; examples: GrammarExample[] }`, `export interface GrammarStep { number: string; title: string; intro?: string; blocks: GrammarBlock[]; note?: string; table?: { headers: string[]; rows: string[][] } }`, `export const GRAMMAR_STEPS: GrammarStep[]` (15 steps). Consumed by Task 14.

A step is modeled as an intro line, one or more `blocks` (each an optional structure/tag line plus its own examples — several steps, like Modal Verb, present several such blocks in sequence), an optional trailing `note`, and — for the one step that has no examples at all — an optional `table` (Irregular Verb).

- [ ] **Step 1: Write the failing test**

Create `data/grammar.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { GRAMMAR_STEPS } from './grammar'

describe('GRAMMAR_STEPS', () => {
  it('has 15 steps', () => {
    expect(GRAMMAR_STEPS.length).toBe(15)
  })

  it('every step has a title and either at least one example or a table', () => {
    for (const step of GRAMMAR_STEPS) {
      expect(step.title.length).toBeGreaterThan(0)
      const exampleCount = step.blocks.reduce((n, b) => n + b.examples.length, 0)
      expect(exampleCount > 0 || !!step.table).toBe(true)
    }
  })

  it('step 1 is Present Simple', () => {
    expect(GRAMMAR_STEPS[0].title).toBe('Present Simple')
  })

  it('Modal Verb has 5 blocks (the shared structure note plus 4 modals)', () => {
    const modal = GRAMMAR_STEPS.find((s) => s.title === 'Modal Verb')
    expect(modal?.blocks.length).toBe(5)
  })

  it('Irregular Verb has a 12-row table and no examples', () => {
    const irregular = GRAMMAR_STEPS.find((s) => s.title === 'Irregular Verb')
    expect(irregular?.table?.rows.length).toBe(12)
    expect(irregular?.blocks.reduce((n, b) => n + b.examples.length, 0)).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- grammar`
Expected: FAIL — `./grammar` module not found.

- [ ] **Step 3: Implement `data/grammar.ts`**

```ts
export interface GrammarExample {
  en: string
  pron: string
  mean: string
}

export interface GrammarBlock {
  structure?: string
  tag?: string
  examples: GrammarExample[]
}

export interface GrammarStep {
  number: string
  title: string
  intro?: string
  blocks: GrammarBlock[]
  note?: string
  table?: { headers: string[]; rows: string[][] }
}

export const GRAMMAR_STEPS: GrammarStep[] = [
  {
    number: '১',
    title: 'Present Simple',
    intro: 'Roj-er obbhas ba shotto kotha bolar jonno',
    blocks: [
      {
        structure: 'Subject + verb (base) / verb+s (he/she/it)',
        examples: [
          { en: 'I go to school.', pron: 'আই গো টু স্কুল', mean: 'আমি স্কুলে যাই।' },
          { en: 'She likes tea.', pron: 'শি লাইকস টি', mean: "সে চা পছন্দ করে। (he/she/it-এ 's' বসে)" },
          { en: 'They work here.', pron: 'দে ওয়ার্ক হেয়ার', mean: 'তারা এখানে কাজ করে।' },
        ],
      },
    ],
  },
  {
    number: '২',
    title: 'Past Simple',
    intro: 'Already hoye geche emon kaj bolar jonno',
    blocks: [
      {
        structure: 'Subject + verb2 (past form)',
        examples: [
          { en: 'I went to school.', pron: 'আই ওয়েন্ট টু স্কুল', mean: 'আমি স্কুলে গিয়েছিলাম। (go → went)' },
          { en: 'She liked tea.', pron: 'শি লাইকড টি', mean: 'সে চা পছন্দ করেছিল। (like → liked)' },
          { en: 'They worked here.', pron: 'দে ওয়ার্কড হেয়ার', mean: 'তারা এখানে কাজ করেছিল। (work → worked)' },
        ],
      },
    ],
  },
  {
    number: '৩',
    title: 'Future Simple',
    intro: 'Pore hobe emon kaj bolar jonno',
    blocks: [
      {
        structure: 'Subject + will + verb (base)',
        examples: [
          { en: 'I will go to school.', pron: 'আই উইল গো টু স্কুল', mean: 'আমি স্কুলে যাবো।' },
          { en: 'She will like tea.', pron: 'শি উইল লাইক টি', mean: 'সে চা পছন্দ করবে।' },
          { en: 'They will work here.', pron: 'দে উইল ওয়ার্ক হেয়ার', mean: 'তারা এখানে কাজ করবে।' },
        ],
      },
    ],
  },
  {
    number: '৪',
    title: 'Irregular Verb',
    intro: "Ei verb gula-r past form 'ed' add kore hoy na — alada mukhosto korte hoy",
    blocks: [],
    table: {
      headers: ['Base', 'Past', 'অর্থ'],
      rows: [
        ['go', 'went', 'যাওয়া'],
        ['eat', 'ate', 'খাওয়া'],
        ['have', 'had', 'থাকা/পাওয়া'],
        ['do', 'did', 'করা'],
        ['see', 'saw', 'দেখা'],
        ['come', 'came', 'আসা'],
        ['make', 'made', 'বানানো'],
        ['take', 'took', 'নেওয়া'],
        ['give', 'gave', 'দেওয়া'],
        ['know', 'knew', 'জানা'],
        ['say', 'said', 'বলা'],
        ['think', 'thought', 'ভাবা'],
      ],
    },
  },
  {
    number: '৫',
    title: 'Negative Sentence',
    intro: '"না" bolar jonno',
    blocks: [
      {
        structure: 'Subject + do/does/did + not + verb (base)',
        examples: [
          { en: "I don't go to school.", pron: 'আই ডোন্ট গো টু স্কুল', mean: 'আমি স্কুলে যাই না। (Present)' },
          { en: "She doesn't like tea.", pron: 'শি ডাজেন্ট লাইক টি', mean: 'সে চা পছন্দ করে না। (he/she/it — doesn\'t)' },
          { en: "I didn't go to school.", pron: 'আই ডিডেন্ট গো টু স্কুল', mean: 'আমি স্কুলে যাইনি। (Past)' },
          { en: "I won't go to school.", pron: 'আই ওন্ট গো টু স্কুল', mean: 'আমি স্কুলে যাবো না। (Future)' },
        ],
      },
    ],
  },
  {
    number: '৬',
    title: 'Question Sentence',
    intro: 'Proshno korar jonno',
    blocks: [
      {
        structure: 'Do/Does/Did + subject + verb (base) + ?',
        examples: [
          { en: 'Do you go to school?', pron: 'ডু ইউ গো টু স্কুল', mean: 'তুমি কি স্কুলে যাও?' },
          { en: 'Does she like tea?', pron: 'ডাজ শি লাইক টি', mean: 'সে কি চা পছন্দ করে?' },
          { en: 'Did you go to school?', pron: 'ডিড ইউ গো টু স্কুল', mean: 'তুমি কি স্কুলে গিয়েছিলে?' },
          { en: 'Will you go to school?', pron: 'উইল ইউ গো টু স্কুল', mean: 'তুমি কি স্কুলে যাবে?' },
        ],
      },
      {
        structure: 'Wh-word + do/does/did + subject + verb (base)?',
        examples: [
          { en: 'Where do you go?', pron: 'হোয়ের ডু ইউ গো', mean: 'তুমি কোথায় যাও?' },
          { en: 'What does she like?', pron: 'হোয়াট ডাজ শি লাইক', mean: 'সে কী পছন্দ করে?' },
          { en: 'Why did you go?', pron: 'হোয়াই ডিড ইউ গো', mean: 'তুমি কেন গিয়েছিলে?' },
        ],
      },
    ],
    note: 'Mukhosto rakho: does/did use korle verb-e \'s\' ba \'ed\' add hoy na — base form thake. "Does she likes tea?" ভুল, "Does she like tea?" ঠিক।',
  },
  {
    number: '৭',
    title: 'Present Continuous',
    intro: 'Ekhon, ei muhurte cholche emon kaj bolar jonno',
    blocks: [
      {
        structure: 'Subject + am/is/are + verb+ing',
        examples: [
          { en: 'I am eating rice.', pron: 'আই অ্যাম ইটিং রাইস', mean: 'আমি এখন ভাত খাচ্ছি।' },
          { en: 'She is drinking tea.', pron: 'শি ইজ ড্রিংকিং টি', mean: 'সে এখন চা খাচ্ছে।' },
          { en: 'They are working.', pron: 'দে আর ওয়ার্কিং', mean: 'তারা এখন কাজ করছে।' },
        ],
      },
      {
        structure: 'Negative: Subject + am/is/are + not + verb+ing',
        examples: [
          { en: "She is not (isn't) drinking tea.", pron: 'শি ইজ নট (ইজেন্ট) ড্রিংকিং টি', mean: 'সে এখন চা খাচ্ছে না।' },
        ],
      },
      {
        structure: 'Question: Am/Is/Are + subject + verb+ing?',
        examples: [
          { en: 'Are you eating rice?', pron: 'আর ইউ ইটিং রাইস', mean: 'তুমি কি ভাত খাচ্ছো?' },
          { en: 'Is she drinking tea?', pron: 'ইজ শি ড্রিংকিং টি', mean: 'সে কি চা খাচ্ছে?' },
        ],
      },
    ],
    note: '"I eat rice" = roj/obbhas (habit) — "I am eating rice" = ekhon, ei muhurte (right now)',
  },
  {
    number: '৮',
    title: 'Modal Verb',
    intro: 'Ability, permission, advice, obligation bolar jonno — daily conversation-e khub beshi lage',
    blocks: [
      { structure: "Subject + modal + verb (base) — 's'/'ed'/'ing' kokhono add hoy na", examples: [] },
      {
        tag: 'Can — parte para (ability) / anumoti (permission)',
        examples: [
          { en: 'I can swim.', pron: 'আই ক্যান সুইম', mean: 'আমি সাঁতার কাটতে পারি।' },
          { en: 'Can I go now?', pron: 'ক্যান আই গো নাও', mean: 'আমি কি এখন যেতে পারি?' },
        ],
      },
      {
        tag: 'Could — parto (past ability) / bhodro request',
        examples: [
          { en: 'I could swim when I was young.', pron: 'আই কুড সুইম হোয়েন আই ওয়াজ ইয়াং', mean: 'ছোটবেলায় আমি সাঁতার কাটতে পারতাম।' },
          { en: 'Could you help me?', pron: 'কুড ইউ হেল্প মি', mean: 'আপনি কি আমাকে সাহায্য করতে পারবেন? (ভদ্র request)' },
        ],
      },
      {
        tag: 'Should — uchit (advice)',
        examples: [
          { en: 'You should study.', pron: 'ইউ শুড স্টাডি', mean: 'তোমার পড়াশোনা করা উচিত।' },
          { en: "You shouldn't smoke.", pron: 'ইউ শুডেন্ট স্মোক', mean: 'তোমার ধূমপান করা উচিত না।' },
        ],
      },
      {
        tag: 'Must — obosshoi korte hobe (strong obligation)',
        examples: [
          { en: 'I must go now.', pron: 'আই মাস্ট গো নাও', mean: 'আমাকে এখন অবশ্যই যেতে হবে।' },
          { en: "You mustn't lie.", pron: 'ইউ মাসেন্ট লাই', mean: 'তুমি মিথ্যা বলতে পারবে না — কখনো না।' },
        ],
      },
    ],
    note: 'Modal-er por verb-e kono \'s\', \'ed\', \'ing\' add hoy na। "She can goes" ভুল — "She can go" ঠিক।',
  },
  {
    number: '৯',
    title: 'Article (a / an / the)',
    intro: 'a/an — kono ekta jinis (unspecified) — the — nirdishto/jana jinis (specific)',
    blocks: [
      {
        structure: 'a + consonant sound, an + vowel sound (a,e,i,o,u)',
        examples: [
          { en: 'I have a book.', pron: 'আই হ্যাভ আ বুক', mean: 'আমার একটা বই আছে।' },
          { en: 'I have an apple.', pron: 'আই হ্যাভ অ্যান অ্যাপল', mean: 'আমার একটা আপেল আছে। (apple vowel sound দিয়ে শুরু — an)' },
          { en: 'The book on the table is mine.', pron: 'দ্য বুক অন দ্য টেবিল ইজ মাইন', mean: 'টেবিলের ওপর বইটা আমার। (নির্দিষ্ট বই — the)' },
        ],
      },
    ],
  },
  {
    number: '১০',
    title: 'Preposition',
    intro: 'Jaiga o shomoy bojhanor jonno',
    blocks: [
      {
        examples: [
          { en: 'The pen is in the box.', pron: 'দ্য পেন ইজ ইন দ্য বক্স', mean: 'কলমটা বাক্সের ভেতরে। (in = ভেতরে)' },
          { en: 'The book is on the table.', pron: 'দ্য বুক ইজ অন দ্য টেবিল', mean: 'বইটা টেবিলের ওপরে। (on = ওপরে)' },
          { en: 'I will meet you at 5 PM.', pron: 'আই উইল মিট ইউ অ্যাট ফাইভ পিএম', mean: 'আমি বিকেল ৫টায় তোমার সাথে দেখা করবো। (at = নির্দিষ্ট সময়/জায়গা)' },
          { en: 'This gift is for you.', pron: 'দিস গিফট ইজ ফর ইউ', mean: 'এই উপহারটা তোমার জন্য। (for = জন্য)' },
          { en: 'I am going to school.', pron: 'আই অ্যাম গোয়িং টু স্কুল', mean: 'আমি স্কুলে যাচ্ছি। (to = দিকে)' },
          { en: 'This is a gift from my friend.', pron: 'দিস ইজ আ গিফট ফ্রম মাই ফ্রেন্ড', mean: 'এটা আমার বন্ধুর কাছ থেকে পাওয়া উপহার। (from = থেকে)' },
        ],
      },
    ],
  },
  {
    number: '১১',
    title: 'Connector (Conjunction)',
    intro: 'Duita sentence/word jog korar jonno',
    blocks: [
      {
        examples: [
          { en: 'I like tea and coffee.', pron: 'আই লাইক টি অ্যান্ড কফি', mean: 'আমি চা এবং কফি দুটোই পছন্দ করি। (and = এবং)' },
          { en: 'I am tired but happy.', pron: 'আই অ্যাম টায়ার্ড বাট হ্যাপি', mean: 'আমি ক্লান্ত কিন্তু খুশি। (but = কিন্তু)' },
          { en: "I couldn't come because I was sick.", pron: 'আই কুডেন্ট কাম বিকজ আই ওয়াজ সিক', mean: 'আমি আসতে পারিনি কারণ আমি অসুস্থ ছিলাম। (because = কারণ)' },
          { en: 'It was raining, so I stayed home.', pron: 'ইট ওয়াজ রেইনিং, সো আই স্টেইড হোম', mean: 'বৃষ্টি হচ্ছিল, তাই আমি বাড়িতে থেকে গেলাম। (so = তাই)' },
        ],
      },
    ],
  },
  {
    number: '১২',
    title: 'Comparative & Superlative',
    intro: 'Duita jinis compare korte (comparative) o shobcheye beshi/kom bojhate (superlative)',
    blocks: [
      {
        structure: 'Comparative: adjective + er + than — Superlative: the + adjective + est',
        examples: [
          { en: 'This bag is bigger than that one.', pron: 'দিস ব্যাগ ইজ বিগার দ্যান দ্যাট ওয়ান', mean: 'এই ব্যাগটা ওইটার চেয়ে বড়।' },
          { en: 'This is the biggest bag.', pron: 'দিস ইজ দ্য বিগেস্ট ব্যাগ', mean: 'এটা সবচেয়ে বড় ব্যাগ।' },
        ],
      },
      {
        tag: 'Irregular: good → better → best, bad → worse → worst',
        examples: [
          { en: 'This tea is better than that one.', pron: 'দিস টি ইজ বেটার দ্যান দ্যাট ওয়ান', mean: 'এই চা-টা ওইটার চেয়ে ভালো।' },
          { en: 'This is the best tea I have had.', pron: 'দিস ইজ দ্য বেস্ট টি আই হ্যাভ হ্যাড', mean: 'এটাই সবচেয়ে ভালো চা যা আমি খেয়েছি।' },
        ],
      },
    ],
  },
  {
    number: '১৩',
    title: 'Time Bola',
    intro: 'Somoy jiggesh kora o bola',
    blocks: [
      {
        examples: [
          { en: 'What time is it?', pron: 'হোয়াট টাইম ইজ ইট', mean: 'এখন কয়টা বাজে?' },
          { en: "It's five o'clock.", pron: "ইটস ফাইভ ও'ক্লক", mean: 'এখন পাঁচটা বাজে।' },
          { en: "It's half past five.", pron: 'ইটস হাফ পাস্ট ফাইভ', mean: 'এখন সাড়ে পাঁচটা।' },
          { en: "It's quarter to six.", pron: 'ইটস কোয়ার্টার টু সিক্স', mean: 'ছয়টা বাজতে ১৫ মিনিট বাকি।' },
        ],
      },
    ],
  },
  {
    number: '১৪',
    title: "Possessive ('s) o Plural",
    intro: "Kar jinis eta bojhate 's — ekadhik bojhate 's' add hoy",
    blocks: [
      {
        structure: "Possessive: Name/Noun + 's + jinis",
        examples: [
          { en: "This is Rahim's book.", pron: "দিস ইজ রহিম'স বুক", mean: 'এটা রহিমের বই।' },
          { en: "That is my sister's phone.", pron: "দ্যাট ইজ মাই সিস্টার'স ফোন", mean: 'ওটা আমার বোনের ফোন।' },
        ],
      },
      {
        structure: 'Plural: noun + s (ekadhik bojhate)',
        examples: [
          { en: 'I have two books.', pron: 'আই হ্যাভ টু বুকস', mean: 'আমার দুইটা বই আছে।' },
          { en: 'There are three children.', pron: 'দেয়ার আর থ্রি চিলড্রেন', mean: 'সেখানে তিনটা বাচ্চা আছে। (child → children, irregular)' },
        ],
      },
    ],
  },
  {
    number: '১৫',
    title: 'Past Continuous',
    intro: 'Otite kono nirdishto somoy-e cholche emon kaj bolar jonno',
    blocks: [
      {
        structure: 'Subject + was/were + verb+ing',
        examples: [
          { en: 'I was eating rice at 8 PM.', pron: 'আই ওয়াজ ইটিং রাইস অ্যাট এইট পিএম', mean: 'রাত ৮টায় আমি ভাত খাচ্ছিলাম।' },
          { en: 'They were working when I called.', pron: 'দে ওয়ার ওয়ার্কিং হোয়েন আই কল্ড', mean: 'আমি কল করার সময় তারা কাজ করছিল।' },
        ],
      },
    ],
    note: 'was: I/He/She/It — were: You/We/They',
  },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- grammar`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: static grammar step data (15 steps)"
```

---

### Task 8: Static Plan, Dialogue, and Prompt Data

**Files:**
- Modify: `scripts/migrate-content.mjs` (extend the Task 6 script to also migrate `PLAN` and `PROMPTS`)
- Create: `data/plan-tasks.ts`, `data/prompts.ts` (generated by the script), `data/dialogues.ts` (hand-written — the prototype's dialogues are markup, not a JS array, so there's nothing to migrate mechanically)
- Test: `data/plan-tasks.test.ts`, `data/dialogues.test.ts`

**Interfaces:**
- Produces: `export const PLAN_TASKS: string[][]` (30 entries), `export interface DialogueLine { speaker: 'A' | 'B' | null; en: string; pron: string; mean: string }` (`null` marks a monologue line with no speaker label), `export interface Dialogue { title: string; lines: DialogueLine[] }`, `export const DIALOGUES: Dialogue[]` (5 dialogues), `export const PROMPTS: string[]` (16 prompts). Consumed by Tasks 15 and 16.

- [ ] **Step 1: Write the failing tests**

Create `data/plan-tasks.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { PLAN_TASKS } from './plan-tasks'

describe('PLAN_TASKS', () => {
  it('has exactly 30 days', () => {
    expect(PLAN_TASKS.length).toBe(30)
  })
  it('every day has at least one task', () => {
    for (const tasks of PLAN_TASKS) {
      expect(tasks.length).toBeGreaterThan(0)
    }
  })
})
```

Create `data/dialogues.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { DIALOGUES } from './dialogues'
import { PROMPTS } from './prompts'

describe('DIALOGUES', () => {
  it('has 5 dialogues', () => {
    expect(DIALOGUES.length).toBe(5)
  })
  it('every dialogue has at least 2 lines', () => {
    for (const dialogue of DIALOGUES) {
      expect(dialogue.lines.length).toBeGreaterThanOrEqual(2)
    }
  })
  it('the Self Introduction dialogue has no speaker labels', () => {
    const intro = DIALOGUES.find((d) => d.title.includes('Self Introduction'))
    expect(intro).toBeDefined()
    expect(intro!.lines.every((l) => l.speaker === null)).toBe(true)
  })
})

describe('PROMPTS', () => {
  it('has 16 prompts', () => {
    expect(PROMPTS.length).toBe(16)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- plan-tasks dialogues`
Expected: FAIL — modules not found.

- [ ] **Step 3: Extend the migration script for `PLAN_TASKS` and `PROMPTS`**

Edit `scripts/migrate-content.mjs` (created in Task 6), inserting this before the final line of the file:

```js
// ---- 30-day plan tasks ----
const PLAN = extractArray('PLAN')
const planTasks = PLAN.map((day) => day.tasks)
const planTs = `export const PLAN_TASKS: string[][] = ${JSON.stringify(planTasks, null, 2)}\n`
fs.writeFileSync(path.join(OUT_DIR, 'plan-tasks.ts'), planTs)
console.log(`Wrote data/plan-tasks.ts (${planTasks.length} days)`)

// ---- Daily writing prompts ----
const PROMPTS = extractArray('PROMPTS')
const promptsTs = `export const PROMPTS: string[] = ${JSON.stringify(PROMPTS, null, 2)}\n`
fs.writeFileSync(path.join(OUT_DIR, 'prompts.ts'), promptsTs)
console.log(`Wrote data/prompts.ts (${PROMPTS.length} prompts)`)
```

Run:

```bash
node scripts/migrate-content.mjs
```

Expected output includes: `Wrote data/plan-tasks.ts (30 days)` and `Wrote data/prompts.ts (16 prompts)`.

- [ ] **Step 4: Hand-write `data/dialogues.ts`**

The prototype's 5 conversation-practice dialogues, transcribed exactly (the "Self Introduction" dialogue has no back-and-forth speakers, so every line uses `speaker: null`):

```ts
export interface DialogueLine {
  speaker: 'A' | 'B' | null
  en: string
  pron: string
  mean: string
}

export interface Dialogue {
  title: string
  lines: DialogueLine[]
}

export const DIALOGUES: Dialogue[] = [
  {
    title: 'Introduction',
    lines: [
      { speaker: 'A', en: 'Hello! What is your name?', pron: 'হ্যালো! হোয়াট ইজ ইয়োর নেম', mean: 'হ্যালো, তোমার নাম কী?' },
      { speaker: 'B', en: 'Hi, my name is Rahim. And you?', pron: 'হাই, মাই নেম ইজ রহিম, অ্যান্ড ইউ', mean: 'হাই, আমার নাম রহিম, তোমার?' },
      { speaker: 'A', en: 'Nice to meet you, Rahim.', pron: 'নাইস টু মিট ইউ রহিম', mean: 'তোমার সাথে দেখা হয়ে ভালো লাগলো, রহিম।' },
      { speaker: 'B', en: 'Nice to meet you too.', pron: 'নাইস টু মিট ইউ টু', mean: 'আমারও ভালো লাগলো।' },
    ],
  },
  {
    title: 'Asking Directions',
    lines: [
      { speaker: 'A', en: 'Excuse me, where is the bus stop?', pron: 'এক্সকিউজ মি, হোয়ের ইজ দ্য বাস স্টপ', mean: 'মাফ করবেন, বাস স্টপ কোথায়?' },
      { speaker: 'B', en: 'Go straight, then turn left.', pron: 'গো স্ট্রেইট, দেন টার্ন লেফট', mean: 'সোজা যান, তারপর বামে ঘুরুন।' },
      { speaker: 'A', en: 'Is it far from here?', pron: 'ইজ ইট ফার ফ্রম হেয়ার', mean: 'এটা কি এখান থেকে দূরে?' },
      { speaker: 'B', en: "No, it's very near.", pron: 'নো, ইটস ভেরি নিয়ার', mean: 'না, এটা খুব কাছে।' },
    ],
  },
  {
    title: 'At a Shop',
    lines: [
      { speaker: 'A', en: 'How much is this shirt?', pron: 'হাউ মাচ ইজ দিস শার্ট', mean: 'এই শার্টটার দাম কত?' },
      { speaker: 'B', en: "It's five hundred taka.", pron: 'ইটস ফাইভ হানড্রেড টাকা', mean: 'এটা পাঁচশো টাকা।' },
      { speaker: 'A', en: 'Can you give a discount?', pron: 'ক্যান ইউ গিভ আ ডিসকাউন্ট', mean: 'আপনি কি একটু ছাড় দিতে পারবেন?' },
      { speaker: 'B', en: 'Okay, four hundred fifty.', pron: 'ওকে, ফোর হানড্রেড ফিফটি', mean: 'ঠিক আছে, চারশো পঞ্চাশ।' },
    ],
  },
  {
    title: 'At the Office',
    lines: [
      { speaker: 'A', en: 'Can we schedule a meeting tomorrow?', pron: 'ক্যান উই স্কেজুল আ মিটিং টুমরো', mean: 'আমরা কি আগামীকাল একটা মিটিং রাখতে পারি?' },
      { speaker: 'B', en: 'Sure, what time works for you?', pron: 'শিওর, হোয়াট টাইম ওয়ার্কস ফর ইউ', mean: 'অবশ্যই, কোন সময়টা তোমার জন্য ভালো?' },
      { speaker: 'A', en: 'How about 10 AM?', pron: 'হাউ অ্যাবাউট টেন এএম', mean: 'সকাল ১০টা কেমন হয়?' },
      { speaker: 'B', en: 'That works for me.', pron: 'দ্যাট ওয়ার্কস ফর মি', mean: 'এটা আমার জন্য ঠিক আছে।' },
    ],
  },
  {
    title: 'Self Introduction (1 minute)',
    lines: [
      { speaker: null, en: 'Hello, my name is Mostofa.', pron: 'হ্যালো, মাই নেম ইজ মোস্তফা', mean: 'হ্যালো, আমার নাম মোস্তফা।' },
      { speaker: null, en: 'I am 28 years old.', pron: 'আই অ্যাম টোয়েন্টি এইট ইয়ার্স ওল্ড', mean: 'আমার বয়স ২৮ বছর।' },
      { speaker: null, en: 'I work as a [your job].', pron: 'আই ওয়ার্ক অ্যাজ আ [ইয়োর জব]', mean: 'আমি একজন [তোমার পেশা] হিসেবে কাজ করি।' },
      { speaker: null, en: 'I live in Dhaka with my family.', pron: 'আই লিভ ইন ঢাকা উইথ মাই ফ্যামিলি', mean: 'আমি পরিবারের সাথে ঢাকায় থাকি।' },
      { speaker: null, en: 'In my free time, I like reading books.', pron: 'ইন মাই ফ্রি টাইম, আই লাইক রিডিং বুকস', mean: 'অবসর সময়ে আমি বই পড়তে পছন্দ করি।' },
      { speaker: null, en: 'I am learning English to speak more confidently.', pron: 'আই অ্যাম লার্নিং ইংলিশ টু স্পিক মোর কনফিডেন্টলি', mean: 'আমি আরও আত্মবিশ্বাসের সাথে কথা বলার জন্য ইংরেজি শিখছি।' },
    ],
  },
]
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- plan-tasks dialogues`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: static 30-day plan, dialogue, and prompt data"
```

---

### Task 9: Supabase Clients and Session Middleware

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `.env.local.example`
- Modify: `README.md` (Supabase setup section)

**Interfaces:**
- Produces: `createBrowserSupabaseClient()` (for Client Components), `createServerSupabaseClient()` (for Server Components/Actions/Route Handlers, `async` — reads/writes cookies). Consumed by every task that touches auth or the database (10, 11, 15, 16).

- [ ] **Step 1: Document the required environment variables**

Create `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 2: Create the browser client**

Create `lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Create the server client**

Create `lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // called from a Server Component with no writable cookie store;
            // safe to ignore because the middleware below refreshes the session.
          }
        },
      },
    }
  )
}
```

- [ ] **Step 4: Create the middleware session-refresh helper**

Create `lib/supabase/middleware.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

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
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/plan']
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtected && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
```

- [ ] **Step 5: Wire the middleware into the app**

Create `middleware.ts`:

```ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 6: Document Supabase project setup in the README**

Append to `README.md`:

```markdown
## Supabase setup

1. Create a free project at https://supabase.com.
2. Copy `.env.local.example` to `.env.local` and fill in your project's
   URL and anon key (Project Settings → API).
3. Open the SQL Editor in the Supabase dashboard and run the contents of
   `supabase/schema.sql` (added in Task 10 of the implementation plan).
4. Restart `npm run dev` after adding `.env.local`.
```

- [ ] **Step 7: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds (no Supabase call happens yet outside of client construction, so a missing `.env.local` will only fail at runtime when a page actually calls these functions — acceptable at this stage since no page uses them yet).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Supabase browser/server clients and session middleware"
```

---

### Task 10: Database Schema

**Files:**
- Create: `supabase/schema.sql`

**Interfaces:**
- Produces: the `plan_start`, `plan_task_progress`, `plan_day_completion`, `practice_log` tables with RLS, used by Tasks 15 and 16's Server Actions. (No `profiles` table — nothing in this plan reads or writes a display name or any other per-user profile field, so it would be dead schema; add it later if a feature actually needs it.)

- [ ] **Step 1: Write the schema**

Create `supabase/schema.sql`:

```sql
-- Plan start: one row per user, set when they click "Start" on /plan
create table if not exists plan_start (
  user_id uuid primary key references auth.users(id) on delete cascade,
  start_date date not null
);

alter table plan_start enable row level security;

create policy "Users manage their own plan start"
  on plan_start for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Plan task progress: one row per (user, day, task)
create table if not exists plan_task_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_day int not null,
  task_index int not null,
  completed_at timestamptz,
  unique (user_id, plan_day, task_index)
);

alter table plan_task_progress enable row level security;

create policy "Users manage their own plan task progress"
  on plan_task_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Plan day completion: one row per (user, day), set once all tasks are done
create table if not exists plan_day_completion (
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_day int not null,
  scheduled_date date not null,
  completed_date date not null,
  primary key (user_id, plan_day)
);

alter table plan_day_completion enable row level security;

create policy "Users manage their own plan day completion"
  on plan_day_completion for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Practice log: daily "I practiced today" streak
create table if not exists practice_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  primary key (user_id, log_date)
);

alter table practice_log enable row level security;

create policy "Users manage their own practice log"
  on practice_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- [ ] **Step 2: Run it against your Supabase project**

In the Supabase dashboard → SQL Editor, paste the contents of `supabase/schema.sql` and run it.
Expected: "Success. No rows returned" and all five tables visible under Table Editor.

- [ ] **Step 3: Manually verify RLS**

In the SQL Editor, run `select * from plan_start;` while authenticated as the dashboard's service role — this bypasses RLS and should simply return an empty result set (0 rows) since no data exists yet. This confirms the tables exist and are queryable; full RLS behavior (a real user only seeing their own rows) is exercised end-to-end in Task 16 once the app writes real rows through the anon key.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Supabase schema and RLS policies for user progress"
```

---

### Task 11: Authentication (Signup, Login, Logout)

**Files:**
- Create: `app/auth/actions.ts`, `app/login/page.tsx`, `app/signup/page.tsx`
- Test: `lib/validation.test.ts`, `lib/validation.ts`

**Interfaces:**
- Consumes: `createServerSupabaseClient()` from Task 9.
- Produces: `signUp(formData: FormData)`, `signIn(formData: FormData)`, `signOut()` Server Actions; `validateCredentials(email: string, password: string): string | null` (returns an error message or `null`). Consumed by Task 12's header (shows sign-out when logged in).

- [ ] **Step 1: Write the failing test for the pure validation helper**

Create `lib/validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateCredentials } from './validation'

describe('validateCredentials', () => {
  it('rejects an empty email', () => {
    expect(validateCredentials('', 'password123')).toBe('Email dao.')
  })
  it('rejects an email without @', () => {
    expect(validateCredentials('not-an-email', 'password123')).toBe('Shothik email dao.')
  })
  it('rejects a password shorter than 6 characters', () => {
    expect(validateCredentials('a@b.com', '123')).toBe('Password kompokkhe 6 character hote hobe.')
  })
  it('returns null for valid credentials', () => {
    expect(validateCredentials('a@b.com', 'password123')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- validation`
Expected: FAIL — `./validation` module not found.

- [ ] **Step 3: Implement `lib/validation.ts`**

```ts
export function validateCredentials(email: string, password: string): string | null {
  if (!email.trim()) return 'Email dao.'
  if (!email.includes('@')) return 'Shothik email dao.'
  if (password.length < 6) return 'Password kompokkhe 6 character hote hobe.'
  return null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- validation`
Expected: PASS (4 tests).

- [ ] **Step 5: Implement the Server Actions**

Create `app/auth/actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { validateCredentials } from '@/lib/validation'

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const error = validateCredentials(email, password)
  if (error) redirect(`/signup?error=${encodeURIComponent(error)}`)

  const supabase = await createServerSupabaseClient()
  const { error: signUpError } = await supabase.auth.signUp({ email, password })
  if (signUpError) redirect(`/signup?error=${encodeURIComponent(signUpError.message)}`)

  redirect('/plan')
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/plan')

  const error = validateCredentials(email, password)
  if (error) redirect(`/login?error=${encodeURIComponent(error)}`)

  const supabase = await createServerSupabaseClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) redirect(`/login?error=${encodeURIComponent(signInError.message)}`)

  redirect(next)
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/')
}
```

- [ ] **Step 6: Build the signup and login pages**

Create `app/signup/page.tsx`:

```tsx
import { signUp } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <Card>
        <h1 className="font-display text-2xl font-semibold">Account Khulo</h1>
        {error && <p className="mt-3 rounded-lg bg-bad/10 p-3 text-sm text-bad">{error}</p>}
        <form action={signUp} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <Button type="submit">Account Khulo</Button>
        </form>
        <p className="mt-4 text-sm text-ink-muted">
          Age theke account ache? <a href="/login" className="text-accent">Login koro</a>
        </p>
      </Card>
    </main>
  )
}
```

Create `app/login/page.tsx`:

```tsx
import { signIn } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <Card>
        <h1 className="font-display text-2xl font-semibold">Login Koro</h1>
        {error && <p className="mt-3 rounded-lg bg-bad/10 p-3 text-sm text-bad">{error}</p>}
        <form action={signIn} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="next" value={next ?? '/plan'} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit">Login Koro</Button>
        </form>
        <p className="mt-4 text-sm text-ink-muted">
          Account nai? <a href="/signup" className="text-accent">Account Khulo</a>
        </p>
      </Card>
    </main>
  )
}
```

- [ ] **Step 7: Manual verification**

Run: `npm run dev`. Visit `/signup`, create an account with a real-format email and a 6+ character password. Expected: redirected to `/plan`. Then visit `/login` with the same credentials after signing out (once Task 12 adds a sign-out control) — expected: redirected back to `/plan`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: email/password signup, login, and logout"
```

---

### Task 12: Landing Page, Site Header, and Theme Toggle

**Files:**
- Modify: `components/site-header.tsx`
- Create: `components/theme-toggle.tsx`, `app/page.tsx`
- Test: `components/theme-toggle.test.tsx`

**Interfaces:**
- Consumes: `signOut` from Task 11, `Button`/`Card` from Task 3.
- Produces: the real site header (nav + auth state + theme toggle) used on every page via `app/layout.tsx`.

- [ ] **Step 1: Write the failing test for the theme toggle**

Create `components/theme-toggle.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from './theme-toggle'

describe('ThemeToggle', () => {
  it('toggles the aria-pressed state when clicked', async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>
    )
    const button = await screen.findByRole('button', { name: /theme/i })
    const before = button.getAttribute('aria-pressed')
    await userEvent.click(button)
    expect(button.getAttribute('aria-pressed')).not.toBe(before)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- theme-toggle`
Expected: FAIL — `./theme-toggle` module not found.

- [ ] **Step 3: Implement the theme toggle**

Create `components/theme-toggle.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- theme-toggle`
Expected: PASS (1 test).

- [ ] **Step 5: Build the real site header**

Replace `components/site-header.tsx`:

```tsx
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

const NAV_LINKS = [
  { href: '/vocab', label: 'Shobdo' },
  { href: '/grammar', label: 'Bakko o Tense' },
  { href: '/practice', label: 'Practice' },
  { href: '/plan', label: '30 Din Plan' },
  { href: '/translate', label: 'Translate' },
]

export async function SiteHeader() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" className="font-display text-lg font-semibold">
          Bolte Shikho
        </Link>
        <nav className="hidden flex-wrap gap-4 text-sm font-medium text-ink-muted md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Logout
              </Button>
            </form>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
```

Note: `Button` does not currently support an `asChild` prop. Update `components/ui/button.tsx`'s usage here instead by rendering the link directly:

```tsx
          {user ? (
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Logout
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button type="button" size="sm">
                Login
              </Button>
            </Link>
          )}
```

- [ ] **Step 6: Build the landing page**

Create `app/page.tsx`:

```tsx
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const FEATURES = [
  { title: 'Shobdo', body: '250+ daily-use word, audio uccharon shoho, quiz mode.' },
  { title: 'Bakko o Tense', body: '15 step-e English grammar — tense theke comparative porjonto.' },
  { title: 'Practice', body: 'Mic diye uccharon check, conversation dialogue, daily prompt.' },
  { title: '30 Din Plan', body: 'Roj-er target, score system, on-time/late calendar tracking.' },
  { title: 'Translator', body: 'English ↔ Bangla, mic diye bolo, 🔊 diye shuno.' },
]

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold text-balance md:text-5xl">
          Bangla theke English-e — bolte shikho, ekhon theke.
        </h1>
        <p className="max-w-xl text-lg text-ink-muted">
          Shobdo, grammar, uccharon practice, ar ekta 30 diner plan — shob ekjaigay.
        </p>
        <Link href="/signup">
          <Button size="default">Ajke Shuru Koro</Button>
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
            <Card>
              <h2 className="font-display text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm text-ink-muted">{feature.body}</p>
            </Card>
          </motion.div>
        ))}
      </section>
    </main>
  )
}
```

- [ ] **Step 7: Manual verification**

Run: `npm run dev`, visit `/`. Confirm the hero renders, feature cards fade/slide in on scroll, and the theme toggle in the header switches light/dark.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: landing page, real site header, theme toggle"
```

---

### Task 13: Vocabulary Page

**Files:**
- Create: `components/vocab/word-card.tsx`, `components/vocab/category-chips.tsx`, `components/vocab/vocab-browser.tsx`, `lib/vocab-filter.ts`, `app/vocab/page.tsx`
- Test: `lib/vocab-filter.test.ts`, `components/vocab/word-card.test.tsx`

**Interfaces:**
- Consumes: `VOCAB` from Task 6, `speak`/`normalizeSpeech` from Task 4, `Tabs`/`Checkbox`/`Input` from Task 3.
- Produces: `filterVocab(categories, query, activeCategory): VocabCategory[]`.

- [ ] **Step 1: Write the failing test for the filter logic**

Create `lib/vocab-filter.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { filterVocab } from './vocab-filter'
import type { VocabCategory } from '@/data/vocab'

const SAMPLE: VocabCategory[] = [
  { name: 'Pronoun', words: [{ en: 'I', pron: 'আই', mean: 'আমি' }] },
  { name: 'Color', words: [{ en: 'Red', pron: 'রেড', mean: 'লাল' }, { en: 'Blue', pron: 'ব্লু', mean: 'নীল' }] },
]

describe('filterVocab', () => {
  it('returns everything when query is empty and category is "All"', () => {
    expect(filterVocab(SAMPLE, '', 'All')).toEqual(SAMPLE)
  })

  it('filters to a single category', () => {
    const result = filterVocab(SAMPLE, '', 'Color')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Color')
  })

  it('matches by English word, pronunciation, or meaning, case-insensitively', () => {
    expect(filterVocab(SAMPLE, 'red', 'All')[0].words).toEqual([{ en: 'Red', pron: 'রেড', mean: 'লাল' }])
    expect(filterVocab(SAMPLE, 'লাল', 'All')[0].words).toEqual([{ en: 'Red', pron: 'রেড', mean: 'লাল' }])
  })

  it('drops categories with no matches', () => {
    expect(filterVocab(SAMPLE, 'zzz', 'All')).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- vocab-filter`
Expected: FAIL — `./vocab-filter` module not found.

- [ ] **Step 3: Implement `lib/vocab-filter.ts`**

```ts
import type { VocabCategory } from '@/data/vocab'

export function filterVocab(
  categories: VocabCategory[],
  query: string,
  activeCategory: string
): VocabCategory[] {
  const q = query.trim().toLowerCase()

  return categories
    .filter((category) => activeCategory === 'All' || activeCategory === category.name)
    .map((category) => ({
      ...category,
      words: category.words.filter(
        (word) =>
          !q ||
          word.en.toLowerCase().includes(q) ||
          word.pron.includes(q) ||
          word.mean.includes(q)
      ),
    }))
    .filter((category) => category.words.length > 0)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- vocab-filter`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the failing test for WordCard**

Create `components/vocab/word-card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { WordCard } from './word-card'

vi.mock('@/lib/speech', () => ({ speak: vi.fn() }))

describe('WordCard', () => {
  it('shows the English word and, once revealed, the pronunciation and meaning', async () => {
    render(<WordCard word={{ en: 'Red', pron: 'রেড', mean: 'লাল' }} quizMode={true} rate={1} />)
    expect(screen.getByText('Red')).toBeInTheDocument()
    expect(screen.queryByText('রেড')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Red'));
    expect(screen.getByText('রেড')).toBeInTheDocument()
    expect(screen.getByText('লাল', { exact: false })).toBeInTheDocument()
  })

  it('always shows pronunciation and meaning when quiz mode is off', () => {
    render(<WordCard word={{ en: 'Red', pron: 'রেড', mean: 'লাল' }} quizMode={false} rate={1} />)
    expect(screen.getByText('রেড')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- word-card`
Expected: FAIL — `./word-card` module not found.

- [ ] **Step 7: Implement WordCard**

Create `components/vocab/word-card.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { VocabWord } from '@/data/vocab'
import { speak } from '@/lib/speech'
import { cn } from '@/lib/utils'

export function WordCard({
  word,
  quizMode,
  rate,
}: {
  word: VocabWord
  quizMode: boolean
  rate: number
}) {
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
        aria-label="Listen"
        onClick={(e) => {
          e.stopPropagation()
          speak(word.en, rate)
        }}
        className="rounded-md p-1 text-accent hover:bg-surface-alt"
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
          দেখতে ট্যাপ করো
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- word-card`
Expected: PASS (2 tests).

- [ ] **Step 9: Build the category chips and the full browser**

Create `components/vocab/category-chips.tsx`:

```tsx
'use client'

import { cn } from '@/lib/utils'

export function CategoryChips({
  categories,
  active,
  onChange,
}: {
  categories: string[]
  active: string
  onChange: (category: string) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {['All', ...categories].map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={cn(
            'flex-none whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium',
            active === category
              ? 'border-accent bg-accent text-accent-ink'
              : 'border-border bg-surface text-ink-muted'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
```

Create `components/vocab/vocab-browser.tsx`:

```tsx
'use client'

import { useMemo, useState } from 'react'
import { VOCAB } from '@/data/vocab'
import { filterVocab } from '@/lib/vocab-filter'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { CategoryChips } from './category-chips'
import { WordCard } from './word-card'

export function VocabBrowser() {
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
        placeholder="Word khojo... (English, uccharon, ba ortho likhe)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <CategoryChips categories={VOCAB.map((c) => c.name)} active={category} onChange={setCategory} />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
        <span>
          {query || category !== 'All' ? `${shownWords} / ${totalWords} word` : `${totalWords}ta word`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRate(1)}
            className={rate === 1 ? 'font-semibold text-accent' : ''}
          >
            Normal speed
          </button>
          <button
            type="button"
            onClick={() => setRate(0.7)}
            className={rate === 0.7 ? 'font-semibold text-accent' : ''}
          >
            Slow speed
          </button>
        </div>
        <label className="flex items-center gap-2">
          Quiz mode
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

- [ ] **Step 10: Build the page**

Create `app/vocab/page.tsx`:

```tsx
import { VocabBrowser } from '@/components/vocab/vocab-browser'

export default function VocabPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Shobdo</h1>
      <p className="mt-1 text-ink-muted">Daily-use English word, uccharon o ortho shoho.</p>
      <div className="mt-6">
        <VocabBrowser />
      </div>
    </main>
  )
}
```

- [ ] **Step 11: Manual verification**

Run: `npm run dev`, visit `/vocab`. Confirm search filters live, category chips filter, quiz mode hides meanings until a card is clicked, and 🔊 speaks the English word.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: vocabulary browser page"
```

---

### Task 14: Grammar Page

**Files:**
- Create: `components/grammar/grammar-steps.tsx`, `app/grammar/page.tsx`
- Test: `components/grammar/grammar-steps.test.tsx`

**Interfaces:**
- Consumes: `GRAMMAR_STEPS` from Task 7, `speak` from Task 4.

- [ ] **Step 1: Write the failing test**

Create `components/grammar/grammar-steps.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GrammarSteps } from './grammar-steps'
import type { GrammarStep } from '@/data/grammar'

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
    render(<GrammarSteps steps={STEPS} />)
    expect(screen.getByText('Present Simple')).toBeInTheDocument()
    expect(screen.getByText('Subject + verb')).toBeInTheDocument()
    expect(screen.getByText('I go.')).toBeInTheDocument()
    expect(screen.getByText('আই গো')).toBeInTheDocument()
  })

  it('renders a table when the step has one instead of examples', () => {
    render(<GrammarSteps steps={STEPS} />)
    expect(screen.getByText('Irregular Verb')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'went' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- grammar-steps`
Expected: FAIL — `./grammar-steps` module not found.

- [ ] **Step 3: Implement the component**

Create `components/grammar/grammar-steps.tsx`:

```tsx
'use client'

import { Volume2 } from 'lucide-react'
import type { GrammarStep } from '@/data/grammar'
import { speak } from '@/lib/speech'

export function GrammarSteps({ steps }: { steps: GrammarStep[] }) {
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
                          aria-label="Listen"
                          onClick={() => speak(example.en)}
                          className="rounded-md p-1 text-accent hover:bg-surface-alt"
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
                    <th key={header} className="border-b border-border bg-surface-alt p-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
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

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- grammar-steps`
Expected: PASS (2 tests).

- [ ] **Step 5: Build the page**

Create `app/grammar/page.tsx`:

```tsx
import { GRAMMAR_STEPS } from '@/data/grammar'
import { GrammarSteps } from '@/components/grammar/grammar-steps'

export default function GrammarPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Bakko o Tense</h1>
      <p className="mt-1 text-ink-muted">Tense theke comparative porjonto, step by step.</p>
      <div className="mt-6">
        <GrammarSteps steps={GRAMMAR_STEPS} />
      </div>
    </main>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: grammar steps page"
```

---

### Task 15: Practice Page (Prompts, Pronunciation Check, Dialogues, Streak)

**Files:**
- Create: `app/practice/actions.ts`, `components/practice/prompt-card.tsx`, `components/practice/pronunciation-check.tsx`, `components/practice/dialogue-list.tsx`, `components/practice/practice-streak.tsx`, `app/practice/page.tsx`
- Test: `components/practice/prompt-card.test.tsx`, `components/practice/pronunciation-check.test.tsx`

**Interfaces:**
- Consumes: `PROMPTS`/`DIALOGUES` from Task 8, `speak`/`normalizeSpeech`/`isSpeechRecognitionSupported`/`createRecognition` from Task 4, `createServerSupabaseClient` from Task 9, `VOCAB` from Task 6 (word pool for pronunciation check).
- Produces: `logPracticeToday()` Server Action.

- [ ] **Step 1: Write the failing test for PromptCard**

Create `components/practice/prompt-card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { PromptCard } from './prompt-card'

describe('PromptCard', () => {
  it('shows one of the given prompts and swaps to another on click', async () => {
    const prompts = ['Prompt A', 'Prompt B']
    render(<PromptCard prompts={prompts} />)
    expect(prompts).toContain(screen.getByTestId('prompt-text').textContent)

    await userEvent.click(screen.getByRole('button', { name: 'Notun Prompt' }))
    expect(prompts).toContain(screen.getByTestId('prompt-text').textContent)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- prompt-card`
Expected: FAIL — `./prompt-card` module not found.

- [ ] **Step 3: Implement PromptCard**

Create `components/practice/prompt-card.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PromptCard({ prompts }: { prompts: string[] }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * prompts.length))

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
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Ajker Topic</span>
      <p data-testid="prompt-text" className="mt-2 font-bengali text-lg">
        {prompts[index]}
      </p>
      <Button className="mt-4" onClick={next}>
        Notun Prompt
      </Button>
    </Card>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- prompt-card`
Expected: PASS (1 test).

- [ ] **Step 5: Write the failing test for the pronunciation-check comparison logic**

Create `components/practice/pronunciation-check.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { normalizeSpeech } from '@/lib/speech'

describe('pronunciation match logic', () => {
  it('treats differently-cased/punctuated but equal text as a match', () => {
    expect(normalizeSpeech('Hello!')).toBe(normalizeSpeech('hello'))
  })
  it('treats different words as a non-match', () => {
    expect(normalizeSpeech('Hello')).not.toBe(normalizeSpeech('World'))
  })
})
```

- [ ] **Step 6: Run test to verify it fails, then passes**

Run: `npm test -- pronunciation-check`
Expected: initially FAIL only if `lib/speech.ts` were missing (it exists from Task 4), so this should already PASS — run it to confirm (2 tests). If it fails, re-check Task 4's `normalizeSpeech` export.

- [ ] **Step 7: Implement the PronunciationCheck component**

Create `components/practice/pronunciation-check.tsx`:

```tsx
'use client'

import { useMemo, useState } from 'react'
import { Volume2, Mic, CheckCircle2, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VOCAB } from '@/data/vocab'
import { speak, normalizeSpeech, isSpeechRecognitionSupported, createRecognition } from '@/lib/speech'

const ALL_WORDS = VOCAB.flatMap((category) => category.words.map((w) => w.en))

export function PronunciationCheck() {
  const supported = useMemo(() => isSpeechRecognitionSupported(), [])
  const [target, setTarget] = useState(() => ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)])
  const [result, setResult] = useState<{ ok: boolean; heard: string } | null>(null)
  const [listening, setListening] = useState(false)

  function nextTarget() {
    setTarget(ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)])
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
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Bolar jonno</span>
      <p className="mt-2 font-bengali text-lg">{target}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="ghost" onClick={() => speak(target)}>
          <Volume2 size={16} /> Shuno
        </Button>
        <Button onClick={startListening} disabled={!supported || listening}>
          <Mic size={16} /> {listening ? 'Shunchi...' : 'Bolo'}
        </Button>
        <Button variant="ghost" onClick={nextTarget}>
          Notun Word
        </Button>
      </div>
      {!supported && (
        <p className="mt-3 font-bengali text-sm text-ink-muted">
          Ei browser-e mic check kaj korbe na. Chrome (Android/Desktop) e best kaj kore.
        </p>
      )}
      {result && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
            result.ok ? 'border-good text-good' : 'border-bad text-bad'
          }`}
        >
          {result.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {result.ok ? `Thik ache! Tumi bolecho: "${result.heard}"` : `Tumi bolecho: "${result.heard}"`}
        </div>
      )}
    </Card>
  )
}
```

- [ ] **Step 8: Implement the Server Action for the practice streak**

Create `app/practice/actions.ts`:

```ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function logPracticeToday() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { loggedIn: false as const }

  const today = new Date().toISOString().slice(0, 10)
  await supabase.from('practice_log').upsert({ user_id: user.id, log_date: today })
  return { loggedIn: true as const }
}
```

- [ ] **Step 9: Build the streak widget, dialogue list, and the page**

Create `components/practice/practice-streak.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logPracticeToday } from '@/app/practice/actions'

export function PracticeStreak() {
  const [status, setStatus] = useState<'idle' | 'done' | 'guest'>('idle')

  async function handleClick() {
    const result = await logPracticeToday()
    setStatus(result.loggedIn ? 'done' : 'guest')
  }

  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Practice Streak</span>
      <p className="mt-2 font-bengali text-sm text-ink-muted">Roj kotha bola chara upay nai.</p>
      <Button className="mt-4" onClick={handleClick} disabled={status === 'done'}>
        {status === 'done' && <CheckCircle2 size={16} />}
        {status === 'done' ? 'Ajke practice hoye geche' : 'Ajke Practice Korlam'}
      </Button>
      {status === 'guest' && (
        <p className="mt-2 font-bengali text-sm text-bad">Streak save korte hole login koro.</p>
      )}
    </Card>
  )
}
```

Create `components/practice/dialogue-list.tsx`:

```tsx
'use client'

import { Volume2 } from 'lucide-react'
import type { Dialogue } from '@/data/dialogues'
import { speak } from '@/lib/speech'

export function DialogueList({ dialogues }: { dialogues: Dialogue[] }) {
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
                    aria-label="Listen"
                    onClick={() => speak(line.en)}
                    className="rounded-md p-1 text-accent hover:bg-surface-alt"
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

Create `app/practice/page.tsx`:

```tsx
import { PROMPTS } from '@/data/prompts'
import { DIALOGUES } from '@/data/dialogues'
import { PromptCard } from '@/components/practice/prompt-card'
import { PronunciationCheck } from '@/components/practice/pronunciation-check'
import { DialogueList } from '@/components/practice/dialogue-list'
import { PracticeStreak } from '@/components/practice/practice-streak'

export default function PracticePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Practice</h1>
      <PracticeStreak />
      <PromptCard prompts={PROMPTS} />
      <PronunciationCheck />
      <DialogueList dialogues={DIALOGUES} />
    </main>
  )
}
```

- [ ] **Step 10: Manual verification**

Run: `npm run dev`, visit `/practice` while logged out — "Ajke Practice Korlam" should show the guest message. Log in and click it again — should flip to the done state. Confirm 🎤/🔊 buttons work in Chrome.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: practice page (prompts, pronunciation check, dialogues, streak)"
```

---

### Task 16: 30-Day Plan Page (Start, Checklist, Score, Calendar)

**Files:**
- Create: `app/plan/actions.ts`, `components/plan/plan-start-card.tsx`, `components/plan/plan-score-card.tsx`, `components/plan/plan-calendar.tsx`, `components/plan/plan-task-list.tsx`, `app/plan/page.tsx`
- Test: `components/plan/plan-calendar.test.tsx`

**Interfaces:**
- Consumes: `PLAN_TASKS` from Task 8, `dateFromStartOffset`/`getCurrentPlanDay`/`computeDayStatus`/`computeScore`/`DayStatus` from Task 5, `createServerSupabaseClient` from Task 9, `Checkbox` from Task 3.
- Produces: `startPlan()`, `toggleTask(planDay: number, taskIndex: number, completed: boolean)` Server Actions.

- [ ] **Step 1: Write the failing test for the calendar's status-to-color mapping**

Create `components/plan/plan-calendar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PlanCalendar } from './plan-calendar'
import type { DayStatus } from '@/lib/scoring'

describe('PlanCalendar', () => {
  it('renders one cell per day and marks the selected day', () => {
    const statuses: DayStatus[] = ['done-ontime', 'partial', 'future']
    render(<PlanCalendar totalDays={3} statuses={statuses} today={1} selected={2} onSelect={() => {}} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2').closest('button')).toHaveClass('ring-2')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- plan-calendar`
Expected: FAIL — `./plan-calendar` module not found.

- [ ] **Step 3: Implement PlanCalendar**

Create `components/plan/plan-calendar.tsx`:

```tsx
'use client'

import { cn } from '@/lib/utils'
import type { DayStatus } from '@/lib/scoring'

const STATUS_CLASSES: Record<DayStatus, string> = {
  'done-ontime': 'bg-good border-good text-white',
  'done-late': 'bg-accent border-accent text-accent-ink',
  partial: 'bg-surface-alt border-border text-ink',
  missed: 'border-dashed border-bad text-bad bg-transparent',
  future: 'border-border text-ink-muted opacity-50',
}

export function PlanCalendar({
  totalDays,
  statuses,
  today,
  selected,
  onSelect,
}: {
  totalDays: number
  statuses: DayStatus[]
  today: number
  selected: number
  onSelect: (day: number) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10">
      {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => onSelect(day)}
          className={cn(
            'aspect-square rounded-lg border text-xs font-semibold tabular-nums',
            STATUS_CLASSES[statuses[day - 1]],
            day === today && 'border-2 border-accent',
            day === selected && 'ring-2 ring-ink ring-offset-1'
          )}
        >
          {day}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- plan-calendar`
Expected: PASS (1 test).

- [ ] **Step 5: Implement the Server Actions**

Create `app/plan/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function startPlan() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().slice(0, 10)
  await supabase.from('plan_start').upsert({ user_id: user.id, start_date: today })
  revalidatePath('/plan')
}

export async function toggleTask(planDay: number, taskIndex: number, completed: boolean, taskCount: number) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('plan_task_progress').upsert(
    {
      user_id: user.id,
      plan_day: planDay,
      task_index: taskIndex,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,plan_day,task_index' }
  )

  const { count } = await supabase
    .from('plan_task_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('plan_day', planDay)
    .not('completed_at', 'is', null)

  if ((count ?? 0) === taskCount) {
    const { data: startRow } = await supabase
      .from('plan_start')
      .select('start_date')
      .eq('user_id', user.id)
      .single()

    if (startRow) {
      const scheduled = new Date(`${startRow.start_date}T00:00:00`)
      scheduled.setDate(scheduled.getDate() + (planDay - 1))
      const scheduledDate = scheduled.toISOString().slice(0, 10)
      const today = new Date().toISOString().slice(0, 10)

      await supabase
        .from('plan_day_completion')
        .upsert(
          { user_id: user.id, plan_day: planDay, scheduled_date: scheduledDate, completed_date: today },
          { onConflict: 'user_id,plan_day', ignoreDuplicates: true }
        )
    }
  }

  revalidatePath('/plan')
}
```

- [ ] **Step 6: Build the remaining plan components**

Create `components/plan/plan-start-card.tsx`:

```tsx
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { startPlan } from '@/app/plan/actions'

export function PlanStartCard({ today }: { today: string }) {
  return (
    <Card>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Shuru Koro</span>
      <p className="mt-2 font-bengali">
        Ei button-e click korle ajker tarikh ({today}) theke Day 1 shuru hobe.
      </p>
      <form action={startPlan}>
        <Button className="mt-4" type="submit">
          Ajke Theke Plan Shuru Koro
        </Button>
      </form>
    </Card>
  )
}
```

Create `components/plan/plan-score-card.tsx`:

```tsx
import { Card } from '@/components/ui/card'

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
  const stats = [
    { label: 'Score', value: score },
    { label: 'Aj Day / Total', value: `${currentDay}/${totalDays}` },
    { label: 'Din Sesh (on time)', value: doneOnTime },
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

Create `components/plan/plan-task-list.tsx`:

```tsx
'use client'

import { useTransition } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { toggleTask } from '@/app/plan/actions'

export function PlanTaskList({
  day,
  tasks,
  checked,
}: {
  day: number
  tasks: string[]
  checked: boolean[]
}) {
  const [, startTransition] = useTransition()

  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
      {tasks.map((task, i) => (
        <label key={i} className="flex items-start gap-3 p-3">
          <Checkbox
            checked={checked[i] ?? false}
            onChange={(e) => {
              const isChecked = e.target.checked
              startTransition(() => {
                toggleTask(day, i, isChecked, tasks.length)
              })
            }}
          />
          <span className={checked[i] ? 'font-bengali text-ink-muted line-through' : 'font-bengali'}>
            {task}
          </span>
        </label>
      ))}
    </div>
  )
}
```

- [ ] **Step 7: Build the page (Server Component fetching Supabase data, Client Component for the interactive calendar/checklist)**

Create `app/plan/page.tsx`:

```tsx
import { PLAN_TASKS } from '@/data/plan-tasks'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  dateFromStartOffset,
  getCurrentPlanDay,
  computeDayStatus,
  computeScore,
} from '@/lib/scoring'
import { PlanStartCard } from '@/components/plan/plan-start-card'
import { PlanClient } from '@/components/plan/plan-client'

export default async function PlanPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const today = new Date().toISOString().slice(0, 10)

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">30 Din Plan</h1>
        <p className="mt-4 font-bengali text-ink-muted">Plan dekhte/shuru korte login koro.</p>
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
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold">30 Din Plan</h1>
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
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">30 Din Plan o Score</h1>
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

Create `components/plan/plan-client.tsx` (client-side day-selection state, composing the pieces above):

```tsx
'use client'

import { useState } from 'react'
import { PLAN_TASKS } from '@/data/plan-tasks'
import type { DayStatus } from '@/lib/scoring'
import { PlanScoreCard } from './plan-score-card'
import { PlanCalendar } from './plan-calendar'
import { PlanTaskList } from './plan-task-list'

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
        <h2 className="mb-2 font-semibold">Day {selected}</h2>
        <PlanTaskList day={selected} tasks={PLAN_TASKS[selected - 1]} checked={checkedByDay[selected - 1]} />
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Manual end-to-end verification**

Run: `npm run dev`, log in, visit `/plan`. Click "Ajke Theke Plan Shuru Koro" — expect the calendar and Day 1 checklist to appear. Check every Day 1 task — expect Day 1's cell to turn green (done-ontime) and the score to increase. Log out and back in — expect the same state to still be there (proves it's reading from Supabase, not localStorage).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: 30-day plan page with Supabase-backed score and calendar"
```

---

### Task 17: Translator

**Files:**
- Create: `app/api/translate/route.ts`, `components/translate/translator-form.tsx`, `app/translate/page.tsx`
- Test: `app/api/translate/route.test.ts`

**Interfaces:**
- Consumes: `speak`/`createRecognition` from Task 4.
- Produces: `POST /api/translate` accepting `{ text: string; from: 'en' | 'bn'; to: 'en' | 'bn' }`, returning `{ translatedText: string }` or `{ error: string }`.

- [ ] **Step 1: Write the failing tests for the route handler**

Create `app/api/translate/route.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/translate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('POST /api/translate', () => {
  it('returns 400 when text is missing', async () => {
    const response = await POST(makeRequest({ text: '', from: 'en', to: 'bn' }))
    expect(response.status).toBe(400)
  })

  it('returns 400 for an unsupported language code', async () => {
    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'fr' }))
    expect(response.status).toBe(400)
  })

  it('calls MyMemory with the correct langpair and returns its translation', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ responseData: { translatedText: 'হ্যালো' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    const body = await response.json()

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('langpair=en%7Cbn'))
    expect(body).toEqual({ translatedText: 'হ্যালো' })
  })

  it('returns 502 when the upstream call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const response = await POST(makeRequest({ text: 'hello', from: 'en', to: 'bn' }))
    expect(response.status).toBe(502)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- route.test`
Expected: FAIL — `./route` module not found.

- [ ] **Step 3: Implement the route handler**

Create `app/api/translate/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_LANGS = new Set(['en', 'bn'])

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { text, from, to } = body as { text?: string; from?: string; to?: string }

  if (!text || !text.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }
  if (!from || !to || !SUPPORTED_LANGS.has(from) || !SUPPORTED_LANGS.has(to)) {
    return NextResponse.json({ error: 'invalid language code' }, { status: 400 })
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
  const upstream = await fetch(url)
  if (!upstream.ok) {
    return NextResponse.json({ error: 'translation service error' }, { status: 502 })
  }

  const data = await upstream.json()
  const translated = data?.responseData?.translatedText
  if (!translated) {
    return NextResponse.json({ error: 'no translation returned' }, { status: 502 })
  }

  return NextResponse.json({ translatedText: translated })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- route.test`
Expected: PASS (4 tests).

- [ ] **Step 5: Build the translator UI**

Create `components/translate/translator-form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { ArrowLeftRight, Volume2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { speak, createRecognition } from '@/lib/speech'

type Lang = 'en' | 'bn'

const LABEL: Record<Lang, string> = { en: 'English', bn: 'বাংলা' }

export function TranslatorForm() {
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
      if (!res.ok) throw new Error(data.error ?? 'Translation failed')
      setResult(data.translatedText)
    } catch (e) {
      setError('Translate korte parlam na. Abar try koro.')
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
        <button type="button" onClick={swap} aria-label="Swap languages" className="rounded-md p-1 hover:bg-surface-alt">
          <ArrowLeftRight size={16} />
        </button>
        <span className="font-semibold">{LABEL[to]}</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Lekho..."
        className="mt-3 w-full rounded-lg border border-border bg-surface p-3 font-bengali text-sm"
      />

      <div className="mt-2 flex gap-2">
        <Button variant="ghost" size="sm" onClick={startMic} type="button">
          🎤
        </Button>
        <Button size="sm" onClick={translate} disabled={loading} type="button">
          {loading ? 'Translate hocche...' : 'Translate Koro'}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-bad">{error}</p>}

      {result && (
        <div className="mt-4 rounded-lg border border-border bg-surface-alt p-3">
          <p className="font-bengali text-lg">{result}</p>
          <button
            type="button"
            onClick={() => speak(result)}
            aria-label="Listen"
            className="mt-2 flex items-center gap-1 text-sm text-accent"
          >
            <Volume2 size={14} /> Shuno
          </button>
        </div>
      )}
    </Card>
  )
}
```

- [ ] **Step 6: Build the page**

Create `app/translate/page.tsx`:

```tsx
import { TranslatorForm } from '@/components/translate/translator-form'

export default function TranslatePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Translator</h1>
      <p className="mt-1 text-ink-muted">English ↔ বাংলা — lekho, ba mic diye bolo.</p>
      <div className="mt-6">
        <TranslatorForm />
      </div>
    </main>
  )
}
```

- [ ] **Step 7: Manual verification**

Run: `npm run dev`, visit `/translate`. Type an English sentence, click Translate Koro — confirm a Bangla result appears and 🔊 speaks it back. Swap direction and confirm it flips.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: English-Bangla translator via MyMemory API"
```

---

### Task 18: Final Polish, Responsive/Theme QA, README

**Files:**
- Modify: `README.md`
- Verify only (no new source files)

**Interfaces:** None — this task validates the whole app end-to-end.

- [ ] **Step 1: Write the full README**

Replace `README.md`:

```markdown
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
```

- [ ] **Step 2: Run the full automated test suite**

Run: `npm test`
Expected: every test file from Tasks 1–17 passes.

- [ ] **Step 3: Production build check**

Run: `npm run build`
Expected: build completes with no type errors.

- [ ] **Step 4: Manual responsive/theme QA**

Using the browser's device toolbar (or resizing the window), check `/`, `/vocab`, `/grammar`, `/practice`, `/plan`, `/translate` at a mobile width (~375px) and confirm no horizontal scrollbar and no overlapping text. Toggle dark/light with the header button on each page and confirm every surface uses a themed color (no invisible text).

- [ ] **Step 5: Confirm `hris` is untouched**

Run: `git -C /home/iqbal/Project/hris status --porcelain` (if `hris` has its own git repo) or, if it doesn't, `find /home/iqbal/Project/hris -newer /home/iqbal/Project/bolte-shikho/package.json` — expected: no output, confirming nothing under `hris` changed since this project started.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: finalize README and confirm hris is untouched"
```
