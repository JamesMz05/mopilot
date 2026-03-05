import { NextRequest, NextResponse } from 'next/server'

const VALID_USERNAME = 'MoPilot'
const VALID_PASSWORD = 'mopilot2027'
const AUTH_COOKIE = 'demo_auth'
const AUTH_TOKEN = 'mopilot_demo_authenticated'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, password } = body

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    const response = NextResponse.json({ success: true })
    response.cookies.set(AUTH_COOKIE, AUTH_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })
    return response
  }

  return NextResponse.json(
    { success: false, error: 'Ungültige Anmeldedaten' },
    { status: 401 }
  )
}
