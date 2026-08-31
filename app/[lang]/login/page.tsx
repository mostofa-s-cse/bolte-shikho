import { signIn } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'
import { lang } from 'next/root-params'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const t = await getDictionary()
  const locale = (await lang()) === 'en' ? 'en' : 'bn'
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <Card>
        <h1 className="font-display text-2xl font-semibold">{t.login.heading}</h1>
        {error && <p className="mt-3 rounded-lg bg-bad/10 p-3 text-sm text-bad">{error}</p>}
        <form action={signIn} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="next" value={next ?? withLocale('/plan', locale)} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t.login.email}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t.login.password}</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit">{t.login.button}</Button>
        </form>
        <p className="mt-4 text-sm text-ink-muted">
          {t.login.noAccount}
          <a href={withLocale('/signup', locale)} className="text-accent">
            {t.login.signupLink}
          </a>
        </p>
      </Card>
    </main>
  )
}
