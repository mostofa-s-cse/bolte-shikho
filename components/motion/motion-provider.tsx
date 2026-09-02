'use client'

import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

// `MotionConfig` is a client-only framer-motion component, but
// `app/[lang]/layout.tsx` is a Server Component (it awaits `params` and
// reads the dictionary server-side), so it can't use `MotionConfig`
// directly. This thin client wrapper gives the server layout a client
// boundary to render into — a Server Component can render a Client
// Component and pass it Server Component children, so this is a safe,
// standard pattern.
//
// `reducedMotion="user"` makes framer-motion itself neutralize
// transform/opacity animations for users who prefer reduced motion,
// entirely inside the framer-motion runtime — the rendered DOM tree is
// identical either way, so server and client HTML never disagree (unlike
// the old per-component `useReducedMotion()` branches, which rendered a
// different tree on the server vs. the client's first paint).
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
