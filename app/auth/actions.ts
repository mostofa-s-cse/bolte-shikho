'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { validateCredentials, validateName, safeRedirectPath } from '@/lib/validation'

export async function signUp(formData: FormData) {
  const name = String(formData.get('name') ?? '')
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const nameError = validateName(name)
  if (nameError) redirect(`/signup?error=${encodeURIComponent(nameError)}`)

  const error = validateCredentials(email, password)
  if (error) redirect(`/signup?error=${encodeURIComponent(error)}`)

  const supabase = await createServerSupabaseClient()
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name.trim() } },
  })
  if (signUpError) redirect(`/signup?error=${encodeURIComponent(signUpError.message)}`)

  // With "Confirm email" enabled (the default on a new Supabase project)
  // signUp returns no session, so sending the user to /plan would just bounce
  // them back to /login through the middleware with no explanation.
  if (!data.session) redirect('/signup/check-email')

  revalidatePath('/', 'layout')
  redirect('/plan')
}

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/plan')

  const error = validateCredentials(email, password)
  if (error) redirect(`/login?error=${encodeURIComponent(error)}`)

  const supabase = await createServerSupabaseClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) redirect(`/login?error=${encodeURIComponent(signInError.message)}`)

  const safeNext = safeRedirectPath(next)

  // The header is rendered by an async Server Component in the root layout;
  // without this the logged-in state can stay stale after the redirect.
  revalidatePath('/', 'layout')
  redirect(safeNext)
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
