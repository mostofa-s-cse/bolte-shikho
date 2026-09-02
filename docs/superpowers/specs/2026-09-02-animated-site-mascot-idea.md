# Animated site + mascot — idea note

Status: superseded — see `2026-09-02-animated-site-mascot-design.md` for the
approved design (Phase 1: hero + shared motion system).

## Request

Make hero section and whole site animated/playful — Duolingo-app-like fun
learning feel, but unique (not a copy).

## Decisions made so far

- Visual identity: mascot character (not just motion/illustration style).
- Mascot concept: a parrot. Metaphor fits the product name — parrots
  repeat/mimic speech, "বলতে শিখো" = "learn to speak".

## Open questions (unresolved, pick up here)

- Mascot look/style: flat vector vs. more illustrated; how it fits existing
  warm/minimal design system (Fraunces + Work Sans, accent `#e8a94d`).
- Where mascot appears: hero only, or also practice streak, plan
  completion, quiz feedback, empty/404 states.
- Animation system: framer-motion already a dependency — likely basis for
  scroll-reveal, hover micro-interactions, nav active-indicator, page
  transitions.
- Scope: "whole website" is large — will need phasing (e.g. motion system +
  hero first, then rollout across vocab/grammar/practice/plan/translate
  pages).
- Asset strategy: hand-coded inline SVG mascot vs. external illustration.
- `prefers-reduced-motion` handling.

## Next step when resumed

Continue via superpowers:brainstorming (architectural path) from here —
ask remaining open questions above, then design doc + superpowers:writing-plans.
Do not skip straight to implementation.
