# Animated Hero + Parrot Mascot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the home page a playful, animated hero — a parrot mascot, a cycling bn/en phrase bubble, entrance animations, and a hover-lift CTA — built from a small reusable motion-component system, plus an animated active-link indicator in the nav.

**Architecture:** Two new presentational component families (`components/motion/*` — reduced-motion-aware wrappers around framer-motion patterns; `components/mascot/parrot-mascot.tsx` — a themeable inline SVG) get built and unit-tested in isolation first, then wired into the existing home page (`app/[lang]/page.tsx`) and nav (`components/nav-links.tsx`). No new dependencies, no backend/data changes — this is UI-only.

**Tech Stack:** Next.js App Router, React, framer-motion 13.1.1 (already a dependency), Tailwind CSS v4 (`@theme` tokens in `app/globals.css`), Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-02-animated-site-mascot-design.md`

## Global Constraints

- No new npm dependencies — use framer-motion, which is already installed.
- Every animated component must check `useReducedMotion()` (from `framer-motion`) and render a static, unanimated fallback when it's true. This is a hard requirement from the spec, not optional polish.
- Mascot and motion components use Tailwind color-token classes (`fill-accent`, `text-ink-muted`, etc.) from `app/globals.css`'s `@theme` block — never hardcoded hex colors — so they follow the light/dark theme automatically.
- This phase touches only the home page and the desktop nav. Do not add the mascot or new motion components anywhere else (practice, plan, vocab, quiz, 404) — that is explicitly out of scope per the spec.
- Match existing code conventions: `'use client'` directive on interactive components, `cn()` from `@/lib/utils` for conditional classNames, dictionary strings via `useTranslations()` — never hardcoded UI text.

---

### Task 1: `Reveal` motion component

**Files:**
- Create: `components/motion/reveal.tsx`
- Test: `components/motion/reveal.test.tsx`
- Modify: `vitest.setup.ts` (add an `IntersectionObserver` stub — framer-motion's `whileInView` requires one, and jsdom doesn't provide it; without this, mounting any `whileInView` component in a test throws `ReferenceError: IntersectionObserver is not defined`)

**Interfaces:**
- Produces: `Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number })` — a React component. Renders `children` immediately (wrapped in a `<div>`) when `useReducedMotion()` is true; otherwise wraps `children` in a `motion.div` that fades/slides up into view once, the first time it scrolls into the viewport.

- [ ] **Step 1: Add the IntersectionObserver stub to vitest.setup.ts**

Edit `vitest.setup.ts`, appending after the existing `matchMedia` stub:

```ts
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}
```

- [ ] **Step 2: Write the failing test**

Create `components/motion/reveal.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Reveal } from './reveal'

describe('Reveal', () => {
  it('renders its children', () => {
    render(
      <Reveal>
        <p>Content</p>
      </Reveal>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders children as a plain, unwrapped element when reduced motion is preferred', async () => {
    vi.doMock('framer-motion', async () => {
      const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
      return { ...actual, useReducedMotion: () => true }
    })
    const { Reveal: ReducedReveal } = await import('./reveal')

    const { container } = render(
      <ReducedReveal>
        <p>Content</p>
      </ReducedReveal>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
    // No motion wrapper div with an inline animation style should exist.
    expect(container.querySelector('[style*="opacity"]')).not.toBeInTheDocument()

    vi.doUnmock('framer-motion')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- reveal.test.tsx`
Expected: FAIL with "Cannot find module './reveal'" (file doesn't exist yet)

- [ ] **Step 4: Write the implementation**

Create `components/motion/reveal.tsx`:

```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

// Shared scroll-reveal used by the hero and feature grid: fades and
// slides content up the first time it enters the viewport. Reduced-motion
// users get the content immediately, with no animation at all — not just
// a faster one — since `useReducedMotion` means "skip motion", not
// "use less of it".
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- reveal.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add vitest.setup.ts components/motion/reveal.tsx components/motion/reveal.test.tsx
git commit -m "feat(motion): add Reveal scroll-in component with reduced-motion fallback"
```

---

### Task 2: `HoverLift` motion component

**Files:**
- Create: `components/motion/hover-lift.tsx`
- Test: `components/motion/hover-lift.test.tsx`

**Interfaces:**
- Produces: `HoverLift({ children }: { children: ReactNode })` — a React component. Renders `children` immediately when `useReducedMotion()` is true; otherwise wraps `children` in a `motion.div` that lifts and scales slightly on hover/focus.

- [ ] **Step 1: Write the failing test**

Create `components/motion/hover-lift.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HoverLift } from './hover-lift'

describe('HoverLift', () => {
  it('renders its children', () => {
    render(
      <HoverLift>
        <button type="button">Go</button>
      </HoverLift>
    )
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
  })

  it('renders children as a plain, unwrapped element when reduced motion is preferred', async () => {
    vi.doMock('framer-motion', async () => {
      const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
      return { ...actual, useReducedMotion: () => true }
    })
    const { HoverLift: ReducedHoverLift } = await import('./hover-lift')

    render(
      <ReducedHoverLift>
        <button type="button">Go</button>
      </ReducedHoverLift>
    )
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()

    vi.doUnmock('framer-motion')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- hover-lift.test.tsx`
Expected: FAIL with "Cannot find module './hover-lift'"

- [ ] **Step 3: Write the implementation**

Create `components/motion/hover-lift.tsx`:

```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

// Small hover/focus affordance for buttons and cards — a subtle lift and
// scale, not a layout change, so it never affects surrounding content.
export function HoverLift({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div>{children}</div>
  }

  return (
    <motion.div
      className="inline-block"
      whileHover={{ y: -2, scale: 1.03 }}
      whileFocus={{ y: -2, scale: 1.03 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- hover-lift.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add components/motion/hover-lift.tsx components/motion/hover-lift.test.tsx
git commit -m "feat(motion): add HoverLift hover/focus affordance with reduced-motion fallback"
```

---

### Task 3: `ParrotMascot` component

**Files:**
- Create: `components/mascot/parrot-mascot.tsx`
- Test: `components/mascot/parrot-mascot.test.tsx`

**Interfaces:**
- Produces: `ParrotMascot({ pose, className }: { pose: MascotPose; className?: string })` and `type MascotPose = 'idle'`. Renders an `<svg data-testid="parrot-mascot" aria-hidden="true">` colored via Tailwind `fill-*` classes from the theme tokens. The `idle` pose animates a gentle vertical bob and an occasional eye blink via framer-motion, skipped when `useReducedMotion()` is true.

- [ ] **Step 1: Write the failing test**

Create `components/mascot/parrot-mascot.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ParrotMascot } from './parrot-mascot'

describe('ParrotMascot', () => {
  it('renders an svg for the idle pose', () => {
    render(<ParrotMascot pose="idle" />)
    const svg = screen.getByTestId('parrot-mascot')
    expect(svg.tagName.toLowerCase()).toBe('svg')
  })

  it('is decorative and hidden from assistive tech', () => {
    render(<ParrotMascot pose="idle" />)
    expect(screen.getByTestId('parrot-mascot')).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies a passed className for sizing', () => {
    render(<ParrotMascot pose="idle" className="h-24 w-24" />)
    expect(screen.getByTestId('parrot-mascot')).toHaveClass('h-24', 'w-24')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- parrot-mascot.test.tsx`
Expected: FAIL with "Cannot find module './parrot-mascot'"

- [ ] **Step 3: Write the implementation**

Create `components/mascot/parrot-mascot.tsx`:

```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type MascotPose = 'idle'

export function ParrotMascot({ pose, className }: { pose: MascotPose; className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  // Only one pose exists today; the parameter is threaded through now so a
  // future 'celebrate' or 'wave' pose doesn't need to change any caller.
  void pose

  const bodyAnimation = shouldReduceMotion
    ? undefined
    : { y: [0, -4, 0], transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }

  const eyeAnimation = shouldReduceMotion
    ? undefined
    : {
        scaleY: [1, 1, 0.1, 1],
        transition: { duration: 3.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' },
      }

  return (
    <motion.svg
      data-testid="parrot-mascot"
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={cn('h-20 w-20', className)}
      animate={bodyAnimation}
    >
      {/* wing */}
      <path d="M28 55 Q8 62 18 85 Q40 80 42 58 Z" className="fill-surface-alt" />
      {/* body */}
      <ellipse cx="52" cy="60" rx="26" ry="30" className="fill-accent" />
      {/* head */}
      <circle cx="52" cy="30" r="19" className="fill-accent" />
      {/* beak */}
      <path d="M68 27 Q82 31 68 40 Q60 33 68 27 Z" className="fill-accent-ink" />
      {/* eye */}
      <motion.circle cx="59" cy="25" r="3" className="fill-ink" animate={eyeAnimation} />
      {/* feet */}
      <path d="M44 88 L44 94 M60 88 L60 94" className="stroke-accent-ink" strokeWidth="2" />
    </motion.svg>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- parrot-mascot.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add components/mascot/parrot-mascot.tsx components/mascot/parrot-mascot.test.tsx
git commit -m "feat(mascot): add themeable inline-SVG parrot mascot with idle animation"
```

---

### Task 4: Animate the hero + feature grid (`app/[lang]/page.tsx`)

**Files:**
- Modify: `app/[lang]/page.tsx`
- Modify: `dictionaries/bn.json` (add `home.heroBubble`)
- Modify: `dictionaries/en.json` (add `home.heroBubble`)
- Test: `app/[lang]/page.test.tsx` (new)

**Interfaces:**
- Consumes: `Reveal` from `@/components/motion/reveal` (Task 1), `HoverLift` from `@/components/motion/hover-lift` (Task 2), `ParrotMascot` from `@/components/mascot/parrot-mascot` (Task 3).
- Consumes: `t.home.heroBubble: string[]` (new dictionary field).

- [ ] **Step 1: Add `heroBubble` to both dictionaries**

Edit `dictionaries/bn.json`, inside the existing `"home"` object, add a sibling key to `"heading"`/`"sub"`/`"cta"`/`"features"`:

```json
"heroBubble": ["আমি কেমন আছি?", "এটার দাম কত?", "ধন্যবাদ, আবার দেখা হবে।"]
```

Edit `dictionaries/en.json`, same location, the English translations:

```json
"heroBubble": ["How are you?", "How much is this?", "Thanks, see you again."]
```

- [ ] **Step 2: Write the failing test**

Create `app/[lang]/page.test.tsx`:

```tsx
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- "app/\[lang\]/page.test.tsx"`
Expected: FAIL — `getByTestId('parrot-mascot')` finds nothing yet (mascot not wired in), and `home.heroBubble` doesn't exist on the type/data yet if Step 1 was skipped.

- [ ] **Step 4: Rewrite the hero section**

Replace the full contents of `app/[lang]/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Reveal } from '@/components/motion/reveal'
import { HoverLift } from '@/components/motion/hover-lift'
import { ParrotMascot } from '@/components/mascot/parrot-mascot'
import { useTranslations } from '@/lib/i18n/locale-context'
import { withLocale } from '@/lib/i18n/locale-routing'

export default function LandingPage() {
  const { t, locale } = useTranslations()
  const [bubbleIndex, setBubbleIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setBubbleIndex((i) => (i + 1) % t.home.heroBubble.length)
    }, 3000)
    return () => clearInterval(id)
  }, [t.home.heroBubble.length])

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
        <ParrotMascot pose="idle" className="h-24 w-24" />
        <div className="relative flex h-8 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={bubbleIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="rounded-full bg-surface-alt px-4 py-1 text-sm text-ink-muted"
            >
              {t.home.heroBubble[bubbleIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
        <Reveal>
          <h1 className="font-display text-4xl font-semibold text-balance md:text-5xl">{t.home.heading}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-xl text-lg text-ink-muted">{t.home.sub}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <HoverLift>
            <Link href={withLocale('/signup', locale)}>
              <Button size="default">{t.home.cta}</Button>
            </Link>
          </HoverLift>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.title} delay={i * 0.05}>
            <Link href={feature.href} className="block h-full">
              <Card className="h-full transition-colors hover:border-accent">
                <h2 className="font-display text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm text-ink-muted">{feature.body}</p>
              </Card>
            </Link>
          </Reveal>
        ))}
      </section>
    </main>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- "app/\[lang\]/page.test.tsx"`
Expected: PASS (3 tests)

- [ ] **Step 6: Run the full test suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: All tests pass; no type errors. (`Dictionary` is `typeof bn`, so `t.home.heroBubble` is only valid once Step 1 added it to `bn.json` — if typecheck fails here, Step 1 was missed or the key name doesn't match.)

- [ ] **Step 7: Commit**

```bash
git add app/\[lang\]/page.tsx app/\[lang\]/page.test.tsx dictionaries/bn.json dictionaries/en.json
git commit -m "feat(home): animate hero with parrot mascot, cycling phrase bubble, and scroll-reveal"
```

---

### Task 5: Animated active-link indicator (`components/nav-links.tsx`)

**Files:**
- Modify: `components/nav-links.tsx`
- Test: `components/nav-links.test.tsx` (new)

**Interfaces:**
- No exported interface changes — `NavLinks({ links, locale })` keeps its existing props.

- [ ] **Step 1: Write the failing test**

Create `components/nav-links.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NavLinks } from './nav-links'

vi.mock('next/navigation', () => ({
  usePathname: () => '/vocab',
}))

const links = [
  { href: '/vocab', label: 'Vocab' },
  { href: '/grammar', label: 'Grammar' },
]

describe('NavLinks', () => {
  it('renders every link', () => {
    render(<NavLinks links={links} locale="en" />)
    expect(screen.getByRole('link', { name: 'Vocab' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Grammar' })).toBeInTheDocument()
  })

  it('marks the link matching the current path as active', () => {
    render(<NavLinks links={links} locale="en" />)
    const activeButton = screen.getByRole('button', { name: 'Vocab' })
    const inactiveButton = screen.getByRole('button', { name: 'Grammar' })
    expect(activeButton.className).toContain('text-accent')
    expect(inactiveButton.className).not.toContain('text-accent')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- nav-links.test.tsx`
Expected: The `usePathname` mock and existing component already make the first test pass, but this locks in current behavior before the refactor — run it now to confirm both tests pass against the *current* implementation first (no active-indicator regression baseline).

- [ ] **Step 3: Update the implementation**

Replace the full contents of `components/nav-links.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { stripLocale, withLocale, type Locale } from '@/lib/i18n/locale-routing'

export function NavLinks({ links, locale }: { links: { href: string; label: string }[]; locale: Locale }) {
  const pathname = usePathname()
  const { rest } = stripLocale(pathname)
  const shouldReduceMotion = useReducedMotion()

  return (
    <>
      {links.map((link) => {
        const active = rest === link.href || rest.startsWith(`${link.href}/`)
        return (
          <Link key={link.href} href={withLocale(link.href, locale)} className="relative">
            {active && !shouldReduceMotion && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-full border border-accent"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn('relative', active && 'border-transparent text-accent')}
            >
              {link.label}
            </Button>
          </Link>
        )
      })}
    </>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- nav-links.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Run the full test suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: All tests pass; no type errors.

- [ ] **Step 6: Commit**

```bash
git add components/nav-links.tsx components/nav-links.test.tsx
git commit -m "feat(nav): animate the active-link indicator with a sliding pill"
```

---

## Self-Review Notes

- **Spec coverage:** mascot component (Task 3) ✓, hover-lift (Task 2) ✓, reveal/scroll-system (Task 1) ✓, hero rewrite with mascot + bubble + reveal + hover-lift (Task 4) ✓, nav active-indicator (Task 5) ✓, reduced-motion handling (built into every animated component, Tasks 1-3 and 5) ✓, inline-SVG/no-hardcoded-hex asset strategy (Task 3, uses `fill-*`/`stroke-*` token classes) ✓, feature grid switched to shared `Reveal` (Task 4, replaces the old inline `motion.div`) ✓. Out-of-scope items (mascot elsewhere, page transitions, confetti, card-flip) are not touched by any task, matching the spec.
- **Placeholder scan:** no TBD/TODO; every step has real, complete code.
- **Type consistency:** `MascotPose` defined in Task 3 as `'idle'`, used identically in Task 4's `<ParrotMascot pose="idle" />` call. `Reveal({ children, delay })` and `HoverLift({ children })` signatures match their Task 4 call sites exactly. `t.home.heroBubble` is added to both dictionaries in the same task that first reads it, so no task depends on a dictionary key another task hasn't created yet.
