import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'demo_auth'
const AUTH_TOKEN = 'mopilot_demo_authenticated'
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend-ns8wok04s4sgkcggwg48okcg:8000'

function setAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, AUTH_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
  return response
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, username, password } = body
  const loginId = email || username || ''

  // Require email-based login (DB auth via backend)
  if (!loginId.includes('@')) {
    return NextResponse.json(
      { success: false, error: 'Bitte melden Sie sich mit Ihrer E-Mail-Adresse an.' },
      { status: 400 }
    )
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginId, password }),
    })

    if (backendRes.ok) {
      const data = await backendRes.json()
      const response = NextResponse.json({
        success: true,
        access_token: data.access_token,
        user: data.user,
      })
      return setAuthCookie(response)
    }

    return NextResponse.json(
      { success: false, error: 'E-Mail oder Passwort falsch' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: 'Server nicht erreichbar. Bitte versuchen Sie es später.' },
      { status: 503 }
    )
  }
}
