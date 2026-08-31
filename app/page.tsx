'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const FEATURES = [
  { title: 'Shobdo', href: '/vocab', body: '250+ daily-use word, audio uccharon shoho, quiz mode.' },
  {
    title: 'Bakko o Tense',
    href: '/grammar',
    body: '15 step-e English grammar — tense theke comparative porjonto.',
  },
  {
    title: 'Practice',
    href: '/practice',
    body: 'Mic diye uccharon check, conversation dialogue, daily prompt.',
  },
  {
    title: '30 Din Plan',
    href: '/plan',
    body: 'Roj-er target, score system, on-time/late calendar tracking.',
  },
  { title: 'Translator', href: '/translate', body: 'English ↔ Bangla, mic diye bolo, shune nao.' },
]

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold text-balance md:text-5xl">
          Bangla theke English-e — bolte shikho, ekhon theke.
        </h1>
        <p className="max-w-xl text-lg text-ink-muted">
          Shobdo, grammar, uccharon practice, ar ekta 30 diner plan — shob ekjaigay.
        </p>
        <Link href="/signup">
          <Button size="default">Ajke Shuru Koro</Button>
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
