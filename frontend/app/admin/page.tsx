'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const ROLE_LABELS: Record<string, string> = {
  endkunde: 'Endkunde',
  stationspate: 'Stationspate',
  hotline: 'Hotline',
  betreiber: 'Betreiber',
  flottenmanagement: 'Flottenmanagement',
  fahrzeugbetreuer: 'Fahrzeugbetreuer',
  plattform_support: 'Plattform-Support',
  projekttraeger: 'Projektträger',
  fahrzeugsteller: 'Fahrzeugsteller',
  validierungsstelle: 'Validierungsstelle',
  mopilot_team: 'MoPilot-Team',
}

interface UserItem {
  id: number
  email: string
  name: string
  role: string
  operator: string | null
  is_active: boolean
  created_at: string | null
}

interface RoleOption {
  value: string
  name: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserItem[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { router.push('/'); return }
    const user = JSON.parse(stored)
    if (user.email !== 'admin@mopilot.website') {
      router.push('/')
      return
    }
    fetchData()
  }, [router])

  function authHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  async function fetchData() {
    setLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${API}/api/admin/users`, { headers: authHeaders() }),
        fetch(`${API}/api/admin/roles`, { headers: authHeaders() }),
      ])
      if (usersRes.status === 401 || rolesRes.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/')
        return
      }
      const usersData = await usersRes.json()
      const rolesData = await rolesRes.json()
      setUsers(usersData.users || [])
      setRoles(rolesData.roles || [])
    } catch {
      setMessage({ text: 'Server nicht erreichbar.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function changeRole(userId: number, newRole: string) {
    setSaving(userId)
    setMessage(null)
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        const userName = users.find(u => u.id === userId)?.name || ''
        setMessage({ text: `Rolle von ${userName} geändert zu ${ROLE_LABELS[newRole] || newRole}.`, type: 'success' })
      } else {
        const err = await res.json().catch(() => ({}))
        setMessage({ text: err.detail || 'Fehler beim Ändern der Rolle.', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Server nicht erreichbar.', type: 'error' })
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse">Lade Benutzerverwaltung...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <h1 className="text-xl font-bold">Benutzerverwaltung</h1>
              <p className="text-indigo-300 text-sm">MoPilot Admin</p>
            </div>
          </div>
          <a href="/" className="text-indigo-200 hover:text-white text-sm font-medium transition-colors">
            Hauptmenü
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto py-8 px-6">
        {/* Status message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* User table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Alle Benutzer ({users.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">E-Mail</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Rolle</th>
                  <th className="px-6 py-3">Betreiber</th>
                  <th className="px-6 py-3">Erstellt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-400">{u.id}</td>
                    <td className="px-6 py-3 font-medium text-gray-800">{u.email}</td>
                    <td className="px-6 py-3 text-gray-600">{u.name}</td>
                    <td className="px-6 py-3">
                      <select
                        value={u.role}
                        onChange={e => changeRole(u.id, e.target.value)}
                        disabled={saving === u.id}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:opacity-50"
                      >
                        {roles.map(r => (
                          <option key={r.value} value={r.value}>
                            {ROLE_LABELS[r.value] || r.name}
                          </option>
                        ))}
                      </select>
                      {saving === u.id && (
                        <span className="ml-2 text-xs text-indigo-500 animate-pulse">Speichern...</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500 uppercase text-xs">{u.operator}</td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('de-DE') : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
