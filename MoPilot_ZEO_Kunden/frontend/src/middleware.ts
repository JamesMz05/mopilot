import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'demo_auth'
const AUTH_TOKEN = 'mopilot_demo_authenticated'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page and auth API routes to pass through
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
}
