'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ROLE_TO_SLUG: Record<string, string> = {
  endkunde: 'endkunde',
  stationspate: 'stationspate',
  hotline: 'hotline',
  betreiber: 'betreiber',
  flottenmanagement: 'flottenmanagement',
  fahrzeugbetreuer: 'fahrzeugbetreuer',
  plattform_support: 'plattform-support',
  projekttraeger: 'projekttraeger',
  fahrzeugsteller: 'fahrzeugsteller',
  validierungsstelle: 'validierungsstelle',
  mopilot_team: 'flottenmanagement',
}

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) {
      router.replace('/login')
      return
    }
    const user = JSON.parse(stored)
    const slug = ROLE_TO_SLUG[user.role] || 'endkunde'
    router.replace(`/dashboard/${slug}`)
  }, [router])

  return (
    <div className="h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-surface-500 font-body mt-3">Weiterleitung...</p>
      </div>
    </div>
  )
}
