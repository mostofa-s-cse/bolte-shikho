import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'
import { lang } from 'next/root-params'

export default async function CheckEmailPage() {
  const t = await getDictionary()
  const locale = (await lang()) === 'en' ? 'en' : 'bn'
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <Card>
        <Mail size={24} className="text-accent" />
        <h1 className="mt-3 font-display text-2xl font-semibold">{t.checkEmail.heading}</h1>
        <p className="mt-3 font-bengali text-sm text-ink-muted">{t.checkEmail.body}</p>
        <p className="mt-4 text-sm text-ink-muted">
          {t.checkEmail.done}
          <Link href={withLocale('/login', locale)} className="text-accent">
            {t.checkEmail.loginLink}
          </Link>
        </p>
      </Card>
    </main>
  )
}
