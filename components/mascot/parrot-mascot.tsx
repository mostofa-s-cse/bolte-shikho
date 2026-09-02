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
    : { y: [0, -4, 0], transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const } }

  const eyeAnimation = shouldReduceMotion
    ? undefined
    : {
        scaleY: [1, 1, 0.1, 1],
        transition: { duration: 3.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' as const },
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
