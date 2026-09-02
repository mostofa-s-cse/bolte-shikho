'use client'

import { useRef, useSyncExternalStore } from 'react'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useTranslations } from '@/lib/i18n/locale-context'

const STORAGE_KEY = 'rememberedEmail'
const noopSubscribe = () => () => {}

export function LoginCredentialsFields() {
  const { t } = useTranslations()
  const emailRef = useRef<HTMLInputElement>(null)
  const rememberRef = useRef<HTMLInputElement>(null)

  // localStorage isn't available during SSR, so the remembered email is read
  // via useSyncExternalStore (null until hydration resolves) instead of an
  // effect-driven setState. The `key`s below remount these uncontrolled
  // inputs once the real value is known, so defaultValue/defaultChecked
  // take effect on that fresh mount.
  const storedEmail = useSyncExternalStore(noopSubscribe, () => localStorage.getItem(STORAGE_KEY), () => null)

  function handleEmailChange() {
    if (rememberRef.current?.checked && emailRef.current) {
      localStorage.setItem(STORAGE_KEY, emailRef.current.value)
    }
  }

  function handleRememberChange(checked: boolean) {
    if (checked) localStorage.setItem(STORAGE_KEY, emailRef.current?.value ?? '')
    else localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t.login.email}</Label>
        <Input
          key={storedEmail ?? 'unset'}
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          required
          defaultValue={storedEmail ?? ''}
          onChange={handleEmailChange}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t.login.password}</Label>
        <PasswordInput id="password" name="password" required />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <Checkbox
          key={storedEmail ? 'checked' : 'unchecked'}
          ref={rememberRef}
          defaultChecked={storedEmail !== null}
          onChange={(e) => handleRememberChange(e.target.checked)}
        />
        {t.login.rememberMe}
      </label>
    </>
  )
}
