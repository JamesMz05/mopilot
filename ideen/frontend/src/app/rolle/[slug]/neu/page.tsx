"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Role } from "@/lib/types";

export default function NewIdeaPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const slug = params.slug as string;

  const [role, setRole] = useState<Role | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    apiFetch<Role>(`/roles/${slug}`)
      .then(setRole)
      .catch(() => router.push("/"));
  }, [slug, token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setError("");
    setSubmitting(true);
    try {
      await apiFetch("/ideas", {
        method: "POST",
        token,
        body: { title, description, role_id: role.id },
      });
      router.push(`/rolle/${slug}`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Idee konnte nicht erstellt werden"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!role) {
    return <div className="text-center py-12 text-gray-500">Laden...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/rolle/${slug}`}
        className="text-sm text-mopilot-green hover:underline mb-4 inline-block"
      >
        &larr; Zur&uuml;ck zu {role.name}
      </Link>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Neue Idee f&uuml;r {role.name}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titel
          </label>
          <input
            type="text"
            required
            maxLength={500}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mopilot-green focus:border-transparent"
            placeholder="Kurzer, aussagekräftiger Titel"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beschreibung
          </label>
          <textarea
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mopilot-green focus:border-transparent resize-y"
            placeholder="Beschreiben Sie Ihre Idee ausführlich..."
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-mopilot-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-mopilot-green-dark transition disabled:opacity-50"
          >
            {submitting ? "Wird erstellt..." : "Idee einreichen"}
          </button>
          <Link
            href={`/rolle/${slug}`}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  );
}
