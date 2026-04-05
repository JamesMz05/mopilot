import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'demo_auth'
const AUTH_TOKEN = 'mopilot_demo_authenticated'
const AUTH_API_URL = process.env.AUTH_API_URL || 'http://backend-ns8wok04s4sgkcggwg48okcg:8000'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password } = body

  try {
    // Proxy to mopilot backend for real authentication
    const backendRes = await fetch(`${AUTH_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (backendRes.ok) {
      const data = await backendRes.json()
      const response = NextResponse.json({
        success: true,
        access_token: data.access_token,
        user: data.user,
      })
      // Set cookie for middleware compatibility
      response.cookies.set(AUTH_COOKIE, AUTH_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/',
      })
      return response
    }

    const error = await backendRes.json().catch(() => ({}))
    return NextResponse.json(
      { success: false, error: error.detail || 'Ungültige Anmeldedaten' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: 'Server nicht erreichbar' },
      { status: 503 }
    )
  }
}
