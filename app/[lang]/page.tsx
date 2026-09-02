'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return
    const id = setInterval(() => {
      setBubbleIndex((i) => (i + 1) % t.home.heroBubble.length)
    }, 3000)
    return () => clearInterval(id)
  }, [t.home.heroBubble.length, shouldReduceMotion])

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
        <div className="relative flex min-h-8 items-center justify-center">
          {shouldReduceMotion ? (
            <p className="whitespace-nowrap rounded-full bg-surface-alt px-4 py-1 text-sm text-ink-muted">
              {t.home.heroBubble[0]}
            </p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.p
                key={bubbleIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="whitespace-nowrap rounded-full bg-surface-alt px-4 py-1 text-sm text-ink-muted"
              >
                {t.home.heroBubble[bubbleIndex % t.home.heroBubble.length]}
              </motion.p>
            </AnimatePresence>
          )}
        </div>
        <h1 className="font-display text-4xl font-semibold text-balance md:text-5xl">{t.home.heading}</h1>
        <p className="max-w-xl text-lg text-ink-muted">{t.home.sub}</p>
        <HoverLift>
          <Link href={withLocale('/signup', locale)}>
            <Button size="default">{t.home.cta}</Button>
          </Link>
        </HoverLift>
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
