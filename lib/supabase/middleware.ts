import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { stripLocale, withLocale } from '@/lib/i18n/locale-routing'

export async function updateSession(request: NextRequest, makeResponse: () => NextResponse) {
  let response = makeResponse()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = makeResponse()
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { locale, rest } = stripLocale(request.nextUrl.pathname)
  const isProtected = rest === '/plan' || rest.startsWith('/plan/')

  if (isProtected && !user) {
    const redirectUrl = new URL(withLocale('/login', locale), request.url)
    redirectUrl.searchParams.set('next', withLocale(rest, locale))
    const redirectResponse = NextResponse.redirect(redirectUrl)
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
    return redirectResponse
  }

  return response
}
