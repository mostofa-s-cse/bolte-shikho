'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { validateCredentials } from '@/lib/validation'

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const error = validateCredentials(email, password)
  if (error) redirect(`/signup?error=${encodeURIComponent(error)}`)

  const supabase = await createServerSupabaseClient()
  const { error: signUpError } = await supabase.auth.signUp({ email, password })
  if (signUpError) redirect(`/signup?error=${encodeURIComponent(signUpError.message)}`)

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

  redirect(next)
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/')
}
