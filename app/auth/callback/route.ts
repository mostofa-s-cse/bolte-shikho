import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { currentLocale } from '@/lib/i18n/current-locale'
import { DICTIONARIES } from '@/lib/i18n/dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'
import { safeRedirectPath } from '@/lib/validation'

// Target of Supabase's OAuth redirect (e.g. after "Continue with Google").
// Exchanges the auth code for a real session, then sends the user on.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const locale = await currentLocale()
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(safeRedirectPath(next ?? '', withLocale('/plan', locale)), origin))
    }
  }

  const message = DICTIONARIES[locale].auth.error
  return NextResponse.redirect(
    new URL(withLocale(`/login?error=${encodeURIComponent(message)}`, locale), origin)
  )
}
