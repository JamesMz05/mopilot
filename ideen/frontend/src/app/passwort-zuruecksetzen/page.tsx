"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    if (!token) {
      setError("Kein Reset-Token vorhanden.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: { token, new_password: password },
      });
      setMessage(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Zurücksetzen fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          Ungültiger Link. Bitte fordern Sie einen neuen Link an.
        </div>
        <Link
          href="/passwort-vergessen"
          className="text-mopilot-green font-medium hover:underline"
        >
          Neuen Link anfordern
        </Link>
      </div>
    );
  }

  if (message) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
          {message}
        </div>
        <Link
          href="/login"
          className="inline-block bg-mopilot-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-mopilot-green-dark transition"
        >
          Jetzt anmelden
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Neues Passwort
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mopilot-green focus:border-transparent"
            placeholder="Mindestens 6 Zeichen"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passwort bestätigen
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mopilot-green focus:border-transparent"
            placeholder="Passwort wiederholen"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-mopilot-green text-white py-2.5 rounded-lg font-medium hover:bg-mopilot-green-dark transition disabled:opacity-50"
        >
          {submitting ? "Wird gespeichert..." : "Passwort ändern"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Neues Passwort vergeben</h2>
      <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6"><p className="text-gray-500 text-center">Laden...</p></div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
