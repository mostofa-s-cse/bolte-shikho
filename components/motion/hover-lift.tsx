'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// Small hover/focus affordance for buttons and cards — a subtle lift and
// scale, not a layout change, so it never affects surrounding content.
// Focus is tracked manually via bubbling `onFocus`/`onBlur` (React's
// synthetic events) rather than framer-motion's `whileFocus`, because
// `whileFocus` binds native `focus`/`blur` listeners directly to this
// wrapper div — and native `focus` doesn't bubble, so it never fires when
// the focusable element (e.g. a `<Button>`) is a child of this wrapper.
// Reduced-motion handling is delegated to the app-wide
// `<MotionConfig reducedMotion="user">` (see
// `components/motion/motion-provider.tsx`).
export function HoverLift({ children }: { children: ReactNode }) {
  const [focused, setFocused] = useState(false)

  return (
    <motion.div
      className="inline-block"
      whileHover={{ y: -2, scale: 1.03 }}
      animate={focused ? { y: -2, scale: 1.03 } : { y: 0, scale: 1 }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  )
}
