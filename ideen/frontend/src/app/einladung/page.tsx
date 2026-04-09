"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

function AcceptInviteContent() {
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
      setError("Kein Einladungs-Token vorhanden.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch<{ message: string }>("/auth/accept-invite", {
        method: "POST",
        body: { token, new_password: password },
      });
      setMessage(res.message);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Einladung konnte nicht angenommen werden."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          Ungültiger Einladungslink. Bitte kontaktieren Sie den Administrator.
        </div>
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
          className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold font-body hover:from-primary-700 hover:to-primary-800 transition-all"
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

      <p className="text-surface-600 font-body mb-6">
        Willkommen bei MoPilot! Bitte legen Sie ein Passwort für Ihr Konto fest.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-warm-sm border border-surface-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium font-body text-surface-700 mb-1">
            Passwort
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            placeholder="Mindestens 6 Zeichen"
          />
        </div>
        <div>
          <label className="block text-sm font-medium font-body text-surface-700 mb-1">
            Passwort bestätigen
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-surface-300 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            placeholder="Passwort wiederholen"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || password.length < 6}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2.5 rounded-xl font-semibold font-body hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
        >
          {submitting ? "Wird gespeichert..." : "Passwort festlegen"}
        </button>
      </form>
    </>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-display font-bold text-surface-900 mb-6">
        Konto einrichten
      </h2>
      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-warm-sm p-6">
            <p className="text-surface-500 text-center font-body">Laden...</p>
          </div>
        }
      >
        <AcceptInviteContent />
      </Suspense>
    </div>
  );
}
