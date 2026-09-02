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
