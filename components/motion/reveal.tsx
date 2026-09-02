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
