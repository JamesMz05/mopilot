"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const res = await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setMessage(res.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Anfrage fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Passwort vergessen</h2>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {!message ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Geben Sie Ihre E-Mail-Adresse ein. Falls ein Konto existiert, senden wir Ihnen einen Link zum Zurücksetzen.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mopilot-green focus:border-transparent"
              placeholder="ihre@email.de"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-mopilot-green text-white py-2.5 rounded-lg font-medium hover:bg-mopilot-green-dark transition disabled:opacity-50"
          >
            {submitting ? "Wird gesendet..." : "Link senden"}
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600 mb-4">Prüfen Sie Ihr Postfach.</p>
          <Link
            href="/login"
            className="inline-block bg-mopilot-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-mopilot-green-dark transition"
          >
            Zurück zur Anmeldung
          </Link>
        </div>
      )}

      <p className="text-center text-sm text-gray-500 mt-4">
        <Link href="/login" className="text-mopilot-green font-medium hover:underline">
          Zurück zur Anmeldung
        </Link>
      </p>
    </div>
  );
}
