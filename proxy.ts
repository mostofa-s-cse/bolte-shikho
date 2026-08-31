import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { localeFromPathname, defaultLocale } from '@/lib/i18n/locale-routing'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const found = localeFromPathname(pathname)
  const locale = found ?? defaultLocale

  const url = request.nextUrl.clone()
  if (!found) url.pathname = `/${defaultLocale}${pathname}`

  const makeResponse = () => {
    const response = found ? NextResponse.next({ request }) : NextResponse.rewrite(url, { request })
    response.cookies.set('NEXT_LOCALE', locale)
    return response
  }

  return updateSession(request, makeResponse)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
