import { NextResponse } from 'next/server'

const AUTH_COOKIE = 'demo_auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })
  return response
}
