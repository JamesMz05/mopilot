'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Bei Deployment-Versionskonflikt (Server Action nicht gefunden) → automatisch neu laden
    if (
      error?.message?.includes('Server Action') ||
      error?.message?.includes('next-action') ||
      error?.digest?.includes('NEXT_NOT_FOUND')
    ) {
      window.location.reload()
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Seite neu laden</h2>
        <p className="text-gray-500 mb-6">Die Seite wurde aktualisiert. Bitte laden Sie sie neu.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Neu laden
        </button>
      </div>
    </div>
  )
}
