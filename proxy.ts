import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { localeFromPathname, defaultLocale } from '@/lib/i18n/locale-routing'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const found = localeFromPathname(pathname)

  let response: NextResponse
  if (!found) {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}${pathname}`
    response = NextResponse.rewrite(url)
  } else {
    response = NextResponse.next()
  }
  response.cookies.set('NEXT_LOCALE', found ?? defaultLocale)

  return updateSession(request, response)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
