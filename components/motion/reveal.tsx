'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// Shared scroll-reveal used by the feature grid: fades and slides content
// up the first time it enters the viewport. Reduced-motion handling is
// delegated to the app-wide `<MotionConfig reducedMotion="user">` (see
// `components/motion/motion-provider.tsx`), which neutralizes the
// transform/opacity animation for reduced-motion users without changing
// what gets rendered — so server and client HTML always agree.
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
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
