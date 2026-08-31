import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function CheckEmailPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <Card>
        <Mail size={24} className="text-accent" />
        <h1 className="mt-3 font-display text-2xl font-semibold">Email Check Koro</h1>
        <p className="mt-3 font-bengali text-sm text-ink-muted">
          Amra ekta confirmation link পাঠিয়েছি. Oita click korle account active hobe — tarpor
          login koro.
        </p>
        <p className="mt-4 text-sm text-ink-muted">
          Link click kora hoye geche?{' '}
          <Link href="/login" className="text-accent">
            Login koro
          </Link>
        </p>
      </Card>
    </main>
  )
}
