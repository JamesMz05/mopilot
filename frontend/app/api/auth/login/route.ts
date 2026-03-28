import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'demo_auth'
const AUTH_TOKEN = 'mopilot_demo_authenticated'
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend-ns8wok04s4sgkcggwg48okcg:8000'

// Legacy demo credentials (backward compatibility)
const DEMO_USERNAME = 'mopilot'
const DEMO_PASSWORD = 'mopilot2027'

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

  // 1) Try real authentication via mopilot backend (if it looks like an email)
  if (loginId.includes('@')) {
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
    } catch {
      // Backend not reachable – fall through to demo check
    }
  }

  // 2) Fallback: accept legacy demo credentials (mopilot / mopilot2027)
  if (loginId === DEMO_USERNAME && password === DEMO_PASSWORD) {
    const response = NextResponse.json({
      success: true,
      demo: true,
      user: { name: 'Demo User', role: 'demo' },
    })
    return setAuthCookie(response)
  }

  // 3) If loginId is an email but backend rejected it, return auth error
  if (loginId.includes('@')) {
    return NextResponse.json(
      { success: false, error: 'E-Mail oder Passwort falsch' },
      { status: 401 }
    )
  }

  // 4) Non-email, non-demo: invalid
  return NextResponse.json(
    { success: false, error: 'Ungültige Anmeldedaten' },
    { status: 401 }
  )
}
