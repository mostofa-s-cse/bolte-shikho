'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTranslations } from '@/lib/i18n/locale-context'
import { withLocale } from '@/lib/i18n/locale-routing'

export default function LandingPage() {
  const { t, locale } = useTranslations()

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
        <h1 className="font-display text-4xl font-semibold text-balance md:text-5xl">
          {t.home.heading}
        </h1>
        <p className="max-w-xl text-lg text-ink-muted">{t.home.sub}</p>
        <Link href={withLocale('/signup', locale)}>
          <Button size="default">{t.home.cta}</Button>
        </Link>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link href={feature.href} className="block h-full">
              <Card className="h-full transition-colors hover:border-accent">
                <h2 className="font-display text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm text-ink-muted">{feature.body}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </section>
    </main>
  )
}
