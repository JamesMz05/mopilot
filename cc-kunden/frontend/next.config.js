/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || '',
  },
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://carsharing2go.net https://sharing-community.de https://*.carsharing2go.net https://*.sharing-community.de",
          },
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
    ]
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://cc-kunden-backend:8000'
    return [
      {
        source: '/api/chat/:path*',
        destination: `${backendUrl}/api/chat/:path*`,
      },
      {
        source: '/api/health',
        destination: `${backendUrl}/api/health`,
      },
      {
        source: '/api/tariffs',
        destination: `${backendUrl}/api/tariffs`,
      },
    ]
  },
}

module.exports = nextConfig
