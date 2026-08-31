import { signUp } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'
import { lang } from 'next/root-params'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const t = await getDictionary()
  const locale = (await lang()) === 'en' ? 'en' : 'bn'
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <Card>
        <h1 className="font-display text-2xl font-semibold">{t.signup.heading}</h1>
        {error && <p className="mt-3 rounded-lg bg-bad/10 p-3 text-sm text-bad">{error}</p>}
        <form action={signUp} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t.signup.name}</Label>
            <Input id="name" name="name" type="text" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t.signup.email}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t.signup.password}</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <Button type="submit">{t.signup.button}</Button>
        </form>
        <p className="mt-4 text-sm text-ink-muted">
          {t.signup.haveAccount}
          <a href={withLocale('/login', locale)} className="text-accent">
            {t.signup.loginLink}
          </a>
        </p>
      </Card>
    </main>
  )
}
