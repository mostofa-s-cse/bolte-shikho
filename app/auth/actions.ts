'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { validateCredentials, validateName, safeRedirectPath } from '@/lib/validation'
import { currentLocale } from '@/lib/i18n/current-locale'
import { DICTIONARIES } from '@/lib/i18n/dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'

export async function signUp(formData: FormData) {
  const locale = await currentLocale()
  const t = DICTIONARIES[locale].validation

  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const nameError = validateName(t, name)
  if (nameError) redirect(withLocale(`/signup?error=${encodeURIComponent(nameError)}`, locale))

  const error = validateCredentials(t, email, password)
  if (error) redirect(withLocale(`/signup?error=${encodeURIComponent(error)}`, locale))

  const supabase = await createServerSupabaseClient()
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name.trim() } },
  })
  if (signUpError) {
    redirect(withLocale(`/signup?error=${encodeURIComponent(signUpError.message)}`, locale))
  }

  // With "Confirm email" enabled (the default on a new Supabase project)
  // signUp returns no session, so sending the user to /plan would just bounce
  // them back to /login through the proxy with no explanation.
  if (!data.session) redirect(withLocale('/signup/check-email', locale))

  revalidatePath('/[lang]', 'layout')
  redirect(withLocale('/plan', locale))
}

export async function signIn(formData: FormData) {
  const locale = await currentLocale()
  const t = DICTIONARIES[locale].validation

  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? withLocale('/plan', locale))

  const error = validateCredentials(t, email, password)
  if (error) redirect(withLocale(`/login?error=${encodeURIComponent(error)}`, locale))

  const supabase = await createServerSupabaseClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    redirect(withLocale(`/login?error=${encodeURIComponent(signInError.message)}`, locale))
  }

  const safeNext = safeRedirectPath(next, withLocale('/plan', locale))

  // The header is rendered by an async Server Component in the root layout;
  // without this the logged-in state can stay stale after the redirect.
  revalidatePath('/[lang]', 'layout')
  redirect(safeNext)
}

export async function signOut() {
  const locale = await currentLocale()
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/[lang]', 'layout')
  redirect(withLocale('/', locale))
}
