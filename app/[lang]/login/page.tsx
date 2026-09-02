import { signIn } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GoogleSignInButton } from '@/components/auth/google-signin-button'
import { LoginCredentialsFields } from '@/components/auth/login-credentials-fields'
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
        <div className="mt-6">
          <GoogleSignInButton />
        </div>
        <p className="my-4 text-center text-xs uppercase tracking-wide text-ink-muted">
          {t.auth.orContinue}
        </p>
        <form action={signIn} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next ?? withLocale('/plan', locale)} />
          <LoginCredentialsFields />
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
