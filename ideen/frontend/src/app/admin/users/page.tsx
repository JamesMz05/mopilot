"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Role, UserInfo } from "@/lib/types";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [passwordModal, setPasswordModal] = useState<{ userId: number; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [roleModal, setRoleModal] = useState<{ userId: number; name: string; currentRoleId: number | null } | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRoleId, setCreateRoleId] = useState<number | null>(null);
  const [createUserType, setCreateUserType] = useState<string>("stakeholder");

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    if (user && user.user_type !== "admin") { router.push("/"); return; }

    Promise.all([
      apiFetch<UserInfo[]>("/users", { token }),
      apiFetch<Record<string, Role[]>>("/roles"),
    ])
      .then(([u, r]) => {
        setUsers(u);
        setRoles(Object.values(r).flat());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, user, router]);

  const pendingUsers = users.filter((u) => u.email_verified && !u.approved);
  const activeUsers = users.filter((u) => u.approved);

  async function handleAction(userId: number, action: string, body?: object) {
    setActionLoading(userId);
    try {
      await apiFetch<{ message: string }>(`/users/${userId}/${action}`, {
        method: "POST",
        token,
        body,
      });
      const updated = await apiFetch<UserInfo[]>("/users", { token });
      setUsers(updated);
    } catch { /* ignore */ }
    setActionLoading(null);
  }

  async function handleDelete(userId: number, name: string) {
    if (!confirm(`${name} wirklich löschen? Alle Ideen, Kommentare und Bewertungen werden ebenfalls gelöscht.`)) return;
    setActionLoading(userId);
    try {
      await apiFetch(`/users/${userId}`, { method: "DELETE", token });
      setUsers(users.filter((u) => u.id !== userId));
    } catch { /* ignore */ }
    setActionLoading(null);
  }

  async function handlePasswordReset() {
    if (!passwordModal || !newPassword.trim() || newPassword.length < 6) return;
    setActionLoading(passwordModal.userId);
    try {
      await apiFetch<{ message: string }>(`/users/${passwordModal.userId}/reset-password`, {
        method: "POST",
        token,
        body: { new_password: newPassword },
      });
      setPasswordModal(null);
      setNewPassword("");
    } catch { /* ignore */ }
    setActionLoading(null);
  }

  async function handleRoleChange() {
    if (!roleModal || !selectedRoleId) return;
    setActionLoading(roleModal.userId);
    try {
      await apiFetch<{ message: string }>(`/users/${roleModal.userId}/role`, {
        method: "PATCH",
        token,
        body: { role_id: selectedRoleId },
      });
      const updated = await apiFetch<UserInfo[]>("/users", { token });
      setUsers(updated);
    } catch { /* ignore */ }
    setRoleModal(null);
    setSelectedRoleId(null);
    setActionLoading(null);
  }

  async function handleCreate() {
    if (!createName.trim() || !createEmail.trim() || !createRoleId) return;
    setActionLoading(-1);
    try {
      await apiFetch<{ message: string }>("/users/create", {
        method: "POST",
        token,
        body: {
          name: createName.trim(),
          email: createEmail.trim(),
          role_id: createRoleId,
          user_type: createUserType,
        },
      });
      const updated = await apiFetch<UserInfo[]>("/users", { token });
      setUsers(updated);
      setCreateModal(false);
      setCreateName("");
      setCreateEmail("");
      setCreateRoleId(null);
      setCreateUserType("stakeholder");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Fehler beim Erstellen");
    }
    setActionLoading(null);
  }

  async function handleReinvite(userId: number) {
    setActionLoading(userId);
    try {
      await apiFetch<{ message: string }>(`/users/${userId}/reinvite`, {
        method: "POST",
        token,
      });
      alert("Einladung erneut gesendet.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Fehler beim erneuten Einladen");
    }
    setActionLoading(null);
  }

  function getRoleName(roleId: number | null) {
    if (!roleId) return "\u2014";
    return roles.find((r) => r.id === roleId)?.name || "\u2014";
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <Link href="/admin" className="text-sm font-body text-primary-600 hover:text-primary-800 hover:underline mb-4 inline-flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
        Zurück zum Admin-Dashboard
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-surface-900">Benutzerverwaltung</h2>
        <button
          onClick={() => setCreateModal(true)}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold font-body hover:from-primary-700 hover:to-primary-800 transition-all flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Neuer Benutzer
        </button>
      </div>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <>
          <h3 className="text-lg font-display font-semibold text-surface-900 mb-3 flex items-center gap-2">
            Warten auf Freischaltung
            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">{pendingUsers.length}</span>
          </h3>
          <div className="bg-white rounded-xl shadow-warm-sm border border-amber-200 overflow-hidden mb-8">
            <table className="w-full text-sm font-body">
              <thead className="bg-amber-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">E-Mail</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Rolle</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Registriert</th>
                  <th className="text-right px-4 py-3 font-medium text-surface-600">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {pendingUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-surface-800">{u.name}</td>
                    <td className="px-4 py-3 text-surface-500">{u.email}</td>
                    <td className="px-4 py-3 text-surface-500">{getRoleName(u.role_id)}</td>
                    <td className="px-4 py-3 text-surface-500">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleAction(u.id, "approve")}
                        disabled={actionLoading === u.id}
                        className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Freischalten
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        disabled={actionLoading === u.id}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      >
                        Ablehnen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Active Users */}
      <h3 className="text-lg font-display font-semibold text-surface-900 mb-3">Aktive Benutzer ({activeUsers.length})</h3>
      <div className="bg-white rounded-xl shadow-warm-sm border border-surface-200 overflow-hidden mb-8">
        <table className="w-full text-sm font-body">
          <thead className="bg-surface-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">E-Mail</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Typ</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Rolle</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Registriert</th>
              <th className="text-right px-4 py-3 font-medium text-surface-600">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {activeUsers.map((u) => (
              <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3 font-medium text-surface-800">{u.name}</td>
                <td className="px-4 py-3 text-surface-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.user_type === "admin" ? "bg-red-100 text-red-700"
                    : u.user_type === "team" ? "bg-blue-100 text-blue-700"
                    : "bg-surface-100 text-surface-700"
                  }`}>{u.user_type}</span>
                  {!u.has_password && (
                    <span className="ml-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Eingeladen</span>
                  )}
                </td>
                <td className="px-4 py-3 text-surface-500">
                  <button
                    onClick={() => { setRoleModal({ userId: u.id, name: u.name, currentRoleId: u.role_id }); setSelectedRoleId(u.role_id); }}
                    className="text-primary-600 hover:text-primary-800 hover:underline"
                  >
                    {getRoleName(u.role_id)}
                  </button>
                </td>
                <td className="px-4 py-3 text-surface-500">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  {u.id !== user?.id && (
                    <div className="flex items-center justify-end gap-2">
                      {!u.has_password ? (
                        <button onClick={() => handleReinvite(u.id)} disabled={actionLoading === u.id} className="text-xs text-primary-600 hover:text-primary-800 transition-colors disabled:opacity-50">
                          Erneut einladen
                        </button>
                      ) : (
                        <button onClick={() => { setPasswordModal({ userId: u.id, name: u.name }); setNewPassword(""); }} className="text-xs text-primary-600 hover:text-primary-800 transition-colors">
                          Passwort
                        </button>
                      )}
                      <button onClick={() => handleAction(u.id, "suspend")} disabled={actionLoading === u.id} className="text-xs text-amber-600 hover:text-amber-800 transition-colors disabled:opacity-50">
                        Sperren
                      </button>
                      <button onClick={() => handleDelete(u.id, u.name)} disabled={actionLoading === u.id} className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50">
                        Löschen
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password Reset Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPasswordModal(null)}>
          <div className="bg-white rounded-2xl shadow-warm-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-display font-semibold text-surface-900 mb-4">Passwort zurücksetzen: {passwordModal.name}</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Neues Passwort (min. 6 Zeichen)"
              className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setPasswordModal(null)} className="text-sm font-body text-surface-500 hover:text-surface-700 px-4 py-2">
                Abbrechen
              </button>
              <button
                onClick={handlePasswordReset}
                disabled={newPassword.length < 6 || actionLoading !== null}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold font-body hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setRoleModal(null)}>
          <div className="bg-white rounded-2xl shadow-warm-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-display font-semibold text-surface-900 mb-4">Rolle ändern: {roleModal.name}</h3>
            <select
              value={selectedRoleId || ""}
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
              className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent mb-4"
            >
              <option value="">Rolle auswählen...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRoleModal(null)} className="text-sm font-body text-surface-500 hover:text-surface-700 px-4 py-2">
                Abbrechen
              </button>
              <button
                onClick={handleRoleChange}
                disabled={!selectedRoleId || selectedRoleId === roleModal.currentRoleId || actionLoading !== null}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold font-body hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-warm-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-display font-semibold text-surface-900 mb-4">Neuer Benutzer</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Name"
                className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                autoFocus
              />
              <input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="E-Mail-Adresse"
                className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              <select
                value={createRoleId || ""}
                onChange={(e) => setCreateRoleId(Number(e.target.value))}
                className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="">Rolle auswählen...</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                ))}
              </select>
              <select
                value={createUserType}
                onChange={(e) => setCreateUserType(e.target.value)}
                className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="stakeholder">Stakeholder</option>
                <option value="team">Team</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setCreateModal(false)} className="text-sm font-body text-surface-500 hover:text-surface-700 px-4 py-2">
                Abbrechen
              </button>
              <button
                onClick={handleCreate}
                disabled={!createName.trim() || !createEmail.trim() || !createRoleId || actionLoading !== null}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold font-body hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
              >
                Erstellen & Einladen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
