"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Role, STATUS_LABELS } from "@/lib/types";

interface UserInfo {
  id: number;
  email: string;
  name: string;
  role_id: number | null;
  user_type: string;
  created_at: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Stats {
  totals: { ideas: number; users: number; comments: number; ratings: number };
  top_rated: { id: number; title: string; role: string; avg_rating: number; rating_count: number }[];
  ideas_per_role: { role: string; slug: string; count: number }[];
  ideas_per_status: { status: string; count: number }[];
  recent_activity: { ideas_7d: number; comments_7d: number };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [roles, setRoles] = useState<Record<string, Role[]>>({});
  const [stats, setStats] = useState<Stats | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    if (user && user.user_type !== "admin") { router.push("/"); return; }

    Promise.all([
      apiFetch<UserInfo[]>("/users", { token }),
      apiFetch<Record<string, Role[]>>("/roles"),
      apiFetch<Stats>("/export/stats", { token }),
      apiFetch<Tag[]>("/tags"),
    ])
      .then(([u, r, s, t]) => { setUsers(u); setRoles(r); setStats(s); setTags(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, user, router]);

  async function handleDeleteUser(userId: number) {
    if (!confirm("Benutzer wirklich löschen?")) return;
    try {
      await apiFetch(`/users/${userId}`, { method: "DELETE", token });
      setUsers(users.filter((u) => u.id !== userId));
    } catch { /* ignore */ }
  }

  async function handleCreateTag() {
    if (!newTag.trim() || !token) return;
    const tag = await apiFetch<Tag>("/tags", { method: "POST", token, body: { name: newTag.trim() } });
    setTags([...tags, tag].sort((a, b) => a.name.localeCompare(b.name)));
    setNewTag("");
  }

  async function handleDeleteTag(tagId: number) {
    if (!token) return;
    await apiFetch(`/tags/${tagId}`, { method: "DELETE", token });
    setTags(tags.filter((t) => t.id !== tagId));
  }

  function handleExportCSV() {
    if (!token) return;
    fetch(`/api/export/ideas`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ideen_export.csv";
        link.click();
        URL.revokeObjectURL(url);
      });
  }

  const allRoles = Object.values(roles).flat();
  const getRoleName = (roleId: number | null) => {
    if (!roleId) return "\u2014";
    return allRoles.find((r) => r.id === roleId)?.name || "\u2014";
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <Link href="/" className="text-sm font-body text-primary-600 hover:text-primary-800 hover:underline mb-4 inline-flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
        Zurück
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-surface-900">Admin-Dashboard</h2>
        <button
          onClick={handleExportCSV}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold font-body hover:from-primary-700 hover:to-primary-800 hover:shadow-warm-md transition-all duration-200"
        >
          CSV-Export
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Ideen", value: stats.totals.ideas },
            { label: "Benutzer", value: stats.totals.users },
            { label: "Kommentare", value: stats.totals.comments },
            { label: "Bewertungen", value: stats.totals.ratings },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-warm-sm border border-surface-200 p-5">
              <p className="text-sm font-body text-surface-500">{stat.label}</p>
              <p className="text-3xl font-display font-bold text-primary-700">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      {stats && (
        <div className="bg-white rounded-xl shadow-warm-sm border border-surface-200 p-5 mb-8">
          <h3 className="text-lg font-display font-semibold text-surface-900 mb-3">Letzte 7 Tage</h3>
          <div className="flex gap-8">
            <div>
              <span className="text-2xl font-display font-bold text-primary-700">{stats.recent_activity.ideas_7d}</span>
              <span className="text-sm font-body text-surface-500 ml-2">neue Ideen</span>
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-primary-700">{stats.recent_activity.comments_7d}</span>
              <span className="text-sm font-body text-surface-500 ml-2">neue Kommentare</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Rated Ideas */}
      {stats && stats.top_rated.length > 0 && (
        <>
          <h3 className="text-lg font-display font-semibold text-surface-900 mb-3">Top 5 Ideen</h3>
          <div className="bg-white rounded-xl shadow-warm-sm border border-surface-200 overflow-hidden mb-8">
            <table className="w-full text-sm font-body">
              <thead className="bg-surface-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Idee</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Rolle</th>
                  <th className="text-right px-4 py-3 font-medium text-surface-600">Bewertung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {stats.top_rated.map((idea) => (
                  <tr key={idea.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/idee/${idea.id}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                        {idea.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-surface-500">{idea.role}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-amber-500">&#9733;</span> {idea.avg_rating.toFixed(1)}
                      <span className="text-surface-400 ml-1">({idea.rating_count})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Ideas per Status */}
      {stats && stats.ideas_per_status.length > 0 && (
        <>
          <h3 className="text-lg font-display font-semibold text-surface-900 mb-3">Ideen nach Status</h3>
          <div className="flex flex-wrap gap-3 mb-8">
            {stats.ideas_per_status.map((s) => (
              <div key={s.status} className="bg-white rounded-xl shadow-warm-sm border border-surface-200 px-4 py-3">
                <p className="text-xs font-body text-surface-500">{STATUS_LABELS[s.status] || s.status}</p>
                <p className="text-xl font-display font-bold text-surface-900">{s.count}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tags Management */}
      <h3 className="text-lg font-display font-semibold text-surface-900 mb-3">Tags</h3>
      <div className="bg-white rounded-xl shadow-warm-sm border border-surface-200 p-5 mb-8">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
            placeholder="Neuen Tag erstellen..."
            className="flex-1 border border-surface-300 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow"
          />
          <button
            onClick={handleCreateTag}
            disabled={!newTag.trim()}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold font-body hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
          >
            Erstellen
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm font-body px-3 py-1.5 rounded-full"
            >
              {tag.name}
              <button onClick={() => handleDeleteTag(tag.id)} className="hover:text-red-500 transition-colors">&times;</button>
            </span>
          ))}
          {tags.length === 0 && <p className="text-sm font-body text-surface-400">Keine Tags vorhanden.</p>}
        </div>
      </div>

      {/* Roles Overview */}
      <h3 className="text-lg font-display font-semibold text-surface-900 mb-3">Rollen &amp; Ideen</h3>
      <div className="bg-white rounded-xl shadow-warm-sm border border-surface-200 overflow-hidden mb-8">
        <table className="w-full text-sm font-body">
          <thead className="bg-surface-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Rolle</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Kategorie</th>
              <th className="text-right px-4 py-3 font-medium text-surface-600">Ideen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {allRoles.map((role) => (
              <tr key={role.id} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/rolle/${role.slug}`} className="text-primary-600 hover:text-primary-800 hover:underline">{role.name}</Link>
                </td>
                <td className="px-4 py-3 text-surface-500 capitalize">{role.category}</td>
                <td className="px-4 py-3 text-right font-medium">{role.idea_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Users */}
      <h3 className="text-lg font-display font-semibold text-surface-900 mb-3">Benutzer</h3>
      <div className="bg-white rounded-xl shadow-warm-sm border border-surface-200 overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead className="bg-surface-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">E-Mail</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Typ</th>
              <th className="text-left px-4 py-3 font-medium text-surface-600">Rolle</th>
              <th className="text-right px-4 py-3 font-medium text-surface-600">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3 font-medium text-surface-800">{u.name}</td>
                <td className="px-4 py-3 text-surface-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.user_type === "admin" ? "bg-red-100 text-red-700"
                    : u.user_type === "team" ? "bg-blue-100 text-blue-700"
                    : "bg-surface-100 text-surface-700"
                  }`}>{u.user_type}</span>
                </td>
                <td className="px-4 py-3 text-surface-500">{getRoleName(u.role_id)}</td>
                <td className="px-4 py-3 text-right">
                  {u.id !== user?.id && (
                    <button onClick={() => handleDeleteUser(u.id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                      Löschen
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
