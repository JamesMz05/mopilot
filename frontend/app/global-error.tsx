'use client'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (
      error?.message?.includes('Server Action') ||
      error?.message?.includes('next-action')
    ) {
      window.location.reload()
    }
  }, [error])

  return (
    <html lang="de">
      <body className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Seite neu laden</h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Neu laden
          </button>
        </div>
      </body>
    </html>
  )
}
