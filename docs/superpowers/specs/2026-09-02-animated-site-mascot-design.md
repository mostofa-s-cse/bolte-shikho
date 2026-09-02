# Animated hero + parrot mascot — design (Phase 1)

Status: approved, ready for implementation planning.

## Goal

Give the site a playful, "learning should feel fun" personality —
Duolingo-inspired energy, but with its own identity — starting with the
hero section and a shared motion system the rest of the site can reuse in
later phases. Full-site rollout (practice streak, plan completion, quiz
feedback, empty states) is explicitly out of scope for this phase; this
spec covers Phase 1 only.

## Decisions

- **Visual identity:** a parrot mascot. Parrots repeat/mimic speech —
  matches "বলতে শিখো" ("learn to speak").
- **Asset strategy:** hand-coded inline SVG, not an external illustration
  file. Keeps it dependency-free, themeable (recolors with CSS custom
  properties for light/dark), and small.
- **Animation library:** framer-motion (already a dependency, already used
  for the home page's feature-card scroll-reveal).
- **Scope for this phase:** hero section + a small set of shared,
  reusable motion primitives. Nothing else changes yet.

## Components

### `components/mascot/parrot-mascot.tsx`

A single SVG React component, `<ParrotMascot />`, built from simple
geometric shapes (body, wing, beak, eye) colored from the existing design
tokens (accent `#e8a94d` plus ink/paper tokens), not hardcoded hex, so it
follows the light/dark theme automatically. Accepts a `pose` prop
(`'idle'` for now — the enum exists so later phases can add `'celebrate'`,
`'wave'` without changing callers) and an optional `className` for sizing.
Idle pose has its own subtle animation (gentle vertical bob + occasional
blink) via framer-motion, self-contained inside the component — the hero
doesn't choreograph it.

### `components/motion/reveal.tsx`

Wraps the `initial`/`whileInView`/`viewport`/`transition` pattern already
inlined in `app/[lang]/page.tsx`'s feature grid into a reusable
`<Reveal delay={0}>{children}</Reveal>` component, so the hero (and future
phases) don't repeat that block. Behavior is identical to the existing
inline usage; the feature grid is switched to use it too, for one
consistent source of truth.

### `components/motion/hover-lift.tsx`

A small wrapper (`<HoverLift>{children}</HoverLift>`) adding a subtle
scale/translate-y on hover/focus, for buttons and cards. Used on the
hero's CTA button in this phase; other pages adopt it in later phases.

### Reduced motion

All three components check `useReducedMotion()` (framer-motion's hook,
reads `prefers-reduced-motion`) and skip animated transitions when it's
set — reveal content shows immediately, hover-lift becomes a plain color
change, the mascot's idle pose holds still. This lives inside the shared
components, so callers never have to think about it.

## Hero section changes (`app/[lang]/page.tsx`)

- `<ParrotMascot pose="idle" />` placed above or beside the heading.
- A small animated speech bubble cycling through 2-3 short example phrases
  (one Bangla, one English pair) — plain state + `AnimatePresence` cross-
  fade, not a new dependency. Content comes from a new small
  `home.heroBubble` array in the dictionaries, following the existing
  `dictionaries/bn.json` / `en.json` pattern.
- The heading/subtext/CTA are wrapped in `<Reveal>` on load instead of
  being static, so the hero itself now has the same fade-up entrance as
  the feature cards below it.
- CTA button gets `<HoverLift>`.

## Nav active-indicator (small, bundled into this phase)

`components/site-header.tsx`'s active nav link currently relies on static
styling. Add a `layoutId`-based animated pill/underline (framer-motion
`layoutId` shared-element transition) that slides between links on route
change. Small, self-contained, uses the same library — bundled here rather
than deferred, since it's a natural companion to the motion-system work
and touches a file already stable.

## Testing

- Unit tests for `<Reveal>` and `<HoverLift>`: render without crashing,
  and confirm they respect a mocked `useReducedMotion() === true` (no
  animation props applied / content visible immediately).
- `<ParrotMascot>` unit test: renders valid SVG markup for each defined
  pose value, no animation assertions (motion is exercised visually, not
  in jsdom).
- Existing home-page test coverage (if any) extended to assert the hero
  still renders heading/CTA text — motion wrapper shouldn't hide content
  from non-JS/first paint.

## Explicitly out of scope (future phases)

- Mascot appearances beyond the hero (practice streak, plan day
  completion, quiz feedback, 404/empty states).
- Page-transition animations between routes.
- Confetti/celebration effects.
- Card-flip animations for vocab/quiz components.

## Risks / open items

- Bengali text inside the speech bubble needs to fit a small bubble at
  both mobile and desktop widths — implementer should test with the
  longest configured phrase, not just a short placeholder.
