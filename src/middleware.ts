import { NextResponse, type NextRequest } from 'next/server'
import { EEA_COUNTRY_CODES, GEO_COOKIE, GEO_HEADER } from '@/lib/consent/constants'

// Vercel injects this header at the edge with the visitors IP derived
// country. Absent on other hosts, those visitors fall through to "other",
// same as the no consent-banner behavior before this existed.
export function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country')
  const isEea = !!country && EEA_COUNTRY_CODES.has(country)
  const geoValue = isEea ? 'eea' : 'other'

  // Response cookies only reach the browser on this response and apply
  // starting with its *next* request, layout.tsx renders as part of this
  // same request, so it cant see GEO_COOKIE yet. Forward the value via a
  // request header instead, which Next.js does propagate to this render.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(GEO_HEADER, geoValue)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.cookies.set(GEO_COOKIE, geoValue, {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  })
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js).*)'],
}
