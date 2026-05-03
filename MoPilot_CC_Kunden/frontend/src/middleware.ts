import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'demo_auth'
const AUTH_TOKEN = 'mopilot_demo_authenticated'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page, auth API routes, and backend-proxied API routes
  // Allow login, API routes, and embed pages through without auth
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth') || pathname.startsWith('/api/chat') || pathname.startsWith('/api/health') || pathname.startsWith('/api/tariffs') || pathname.startsWith('/embed') || pathname.startsWith('/quiz')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value

  if (token !== AUTH_TOKEN) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|cc-logo.jpg|robots.txt).*)'],
}
