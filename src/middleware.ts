import { NextResponse, type NextRequest } from 'next/server'
import { EEA_COUNTRY_CODES, GEO_COOKIE } from '@/lib/consent/constants'

// Vercel injects this header at the edge with the visitor's IP-derived
// country. Absent on other hosts, those visitors fall through to "other",
// same as the no-consent-banner behavior before this existed.
export function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country')
  const isEea = !!country && EEA_COUNTRY_CODES.has(country)

  const response = NextResponse.next()
  response.cookies.set(GEO_COOKIE, isEea ? 'eea' : 'other', {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  })
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js).*)'],
}
