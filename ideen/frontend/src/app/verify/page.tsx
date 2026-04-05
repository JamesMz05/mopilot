"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Kein Bestätigungstoken vorhanden.");
      setLoading(false);
      return;
    }

    apiFetch<{ message: string }>(`/auth/verify?token=${encodeURIComponent(token)}`)
      .then((res) => setMessage(res.message))
      .catch((err) => setError(err instanceof Error ? err.message : "Bestätigung fehlgeschlagen."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <>
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-500">Wird bestätigt...</p>
        </div>
      )}

      {message && (
        <div className="bg-white rounded-lg shadow-sm p-6">
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
      )}

      {error && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
          <Link
            href="/login"
            className="text-mopilot-green font-medium hover:underline"
          >
            Zurück zur Anmeldung
          </Link>
        </div>
      )}
    </>
  );
}

export default function VerifyPage() {
  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">E-Mail bestätigen</h2>
      <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-6"><p className="text-gray-500">Laden...</p></div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
