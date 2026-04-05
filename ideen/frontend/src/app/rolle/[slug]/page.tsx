"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import StarRating from "@/components/StarRating";
import { Idea, Role, STATUS_LABELS, STATUS_COLORS } from "@/lib/types";

export default function RolePage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const slug = params.slug as string;

  const [role, setRole] = useState<Role | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      apiFetch<Role>(`/roles/${slug}`),
      apiFetch<Idea[]>(
        `/ideas?role=${slug}&sort=${sort}${statusFilter ? `&status=${statusFilter}` : ""}`,
        { token }
      ),
    ])
      .then(([r, i]) => {
        setRole(r);
        setIdeas(i);
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [slug, token, sort, statusFilter, router]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Laden...</div>;
  }

  if (!role) return null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <Link
            href="/"
            className="text-sm text-mopilot-green hover:underline mb-1 inline-block"
          >
            &larr; Zur&uuml;ck
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">{role.name}</h2>
          <p className="text-gray-500 text-sm">{role.description}</p>
        </div>
        <Link
          href={`/rolle/${slug}/neu`}
          className="bg-mopilot-green text-white px-5 py-2.5 rounded-lg font-medium hover:bg-mopilot-green-dark transition text-center whitespace-nowrap"
        >
          + Neue Idee
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-mopilot-green"
        >
          <option value="newest">Neueste</option>
          <option value="best_rating">Beste Bewertung</option>
          <option value="most_comments">Meiste Kommentare</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-mopilot-green"
        >
          <option value="">Alle Status</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">Noch keine Ideen vorhanden</p>
          <p className="text-sm">
            Seien Sie der Erste und erstellen Sie eine neue Idee!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <Link key={idea.id} href={`/idee/${idea.id}`}>
              <div className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition border border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {idea.title}
                      </h3>
                      {idea.title.startsWith("\u{1F680}") && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          Vision&auml;r
                        </span>
                      )}
                      {idea.title.startsWith("\u{1F916}") && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          KI-umsetzbar
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          STATUS_COLORS[idea.status]
                        }`}
                      >
                        {STATUS_LABELS[idea.status]}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {idea.description.length > 150
                        ? idea.description.slice(0, 150) + "..."
                        : idea.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span>{idea.author_name}</span>
                      <span>
                        {new Date(idea.created_at).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StarRating
                      value={Math.round(idea.avg_rating || 0)}
                      readonly
                      size="sm"
                    />
                    {idea.avg_rating && (
                      <span className="text-xs text-gray-400">
                        {idea.avg_rating.toFixed(1)}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {idea.comment_count}{" "}
                      {idea.comment_count === 1 ? "Kommentar" : "Kommentare"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
