import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { currentLocale } from '@/lib/i18n/current-locale'
import { DICTIONARIES } from '@/lib/i18n/dictionary'
import { withLocale } from '@/lib/i18n/locale-routing'

// Target of the confirmation link Supabase emails when "Confirm email" is on.
// It exchanges the emailed token hash for a real session, then drops the user
// straight into the plan.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const locale = await currentLocale()

  if (tokenHash && type) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      return NextResponse.redirect(new URL(withLocale('/plan', locale), origin))
    }
    return NextResponse.redirect(
      new URL(withLocale(`/login?error=${encodeURIComponent(error.message)}`, locale), origin)
    )
  }

  const message = DICTIONARIES[locale].validation.invalidConfirmLink
  return NextResponse.redirect(
    new URL(withLocale(`/login?error=${encodeURIComponent(message)}`, locale), origin)
  )
}
