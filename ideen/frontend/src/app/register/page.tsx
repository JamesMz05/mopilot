"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Role, CATEGORY_LABELS } from "@/lib/types";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number | "">("");
  const [roles, setRoles] = useState<Record<string, Role[]>>({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<Record<string, Role[]>>("/roles").then(setRoles).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!roleId) {
      setError("Bitte wählen Sie eine Rolle aus.");
      return;
    }
    setSubmitting(true);
    try {
      const message = await register({
        email,
        name,
        password,
        role_id: Number(roleId),
        user_type: "stakeholder",
      });
      setSuccessMessage(message);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Registrierung fehlgeschlagen"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrierung erfolgreich</h2>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
            {successMessage}
          </div>
          <Link
            href="/login"
            className="inline-block bg-mopilot-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-mopilot-green-dark transition"
          >
            Zur Anmeldung
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrieren</h2>

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
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mopilot-green focus:border-transparent"
            placeholder="Ihr Name"
          />
        </div>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passwort
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
            Rolle
          </label>
          <select
            required
            value={roleId}
            onChange={(e) => setRoleId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mopilot-green focus:border-transparent"
          >
            <option value="">Rolle auswählen...</option>
            {["kundennah", "betrieb", "strategie"].map((cat) => (
              <optgroup key={cat} label={CATEGORY_LABELS[cat]}>
                {(roles[cat] || []).map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Ihre Rolle bestimmt, welche Ideenkategorien Sie sehen.
          </p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-mopilot-green text-white py-2.5 rounded-lg font-medium hover:bg-mopilot-green-dark transition disabled:opacity-50"
        >
          {submitting ? "Wird registriert..." : "Registrieren"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Bereits ein Konto?{" "}
        <Link
          href="/login"
          className="text-mopilot-green font-medium hover:underline"
        >
          Jetzt anmelden
        </Link>
      </p>
    </div>
  );
}
