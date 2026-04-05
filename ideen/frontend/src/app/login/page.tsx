"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

const features = [
  { icon: "💡", text: "Ideen einreichen & bewerten", delay: 0 },
  { icon: "🤝", text: "Gemeinsam gestalten", delay: 150 },
  { icon: "🏘️", text: "Mobilität für alle", delay: 300 },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notVerified, setNotVerified] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotVerified(false);
    setResendMessage("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Anmeldung fehlgeschlagen";
      if (msg.includes("nicht bestätigt")) {
        setNotVerified(true);
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendVerification() {
    setResendMessage("");
    try {
      const res = await apiFetch<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: { email },
      });
      setResendMessage(res.message);
    } catch {
      setResendMessage("Fehler beim Senden der Bestätigungsmail.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel – visual branding */}
      <div className="relative lg:w-[60%] bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 flex flex-col justify-center items-center px-8 py-12 lg:py-0 overflow-hidden">
        {/* Topography pattern */}
        <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="topo" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
                <path d="M0 200 Q100 180 200 200 Q300 220 400 200" fill="none" stroke="white" strokeWidth="1" />
                <path d="M0 160 Q80 130 180 155 Q280 180 400 150" fill="none" stroke="white" strokeWidth="0.8" />
                <path d="M0 240 Q120 260 220 240 Q320 220 400 250" fill="none" stroke="white" strokeWidth="0.8" />
                <path d="M0 120 Q60 100 160 115 Q260 130 400 110" fill="none" stroke="white" strokeWidth="0.6" />
                <path d="M0 280 Q140 300 240 280 Q340 260 400 290" fill="none" stroke="white" strokeWidth="0.6" />
                <circle cx="100" cy="100" r="1.5" fill="white" opacity="0.5" />
                <circle cx="300" cy="150" r="1.5" fill="white" opacity="0.5" />
                <circle cx="200" cy="300" r="1.5" fill="white" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-lg text-center lg:text-left">
          {/* Animated Logo */}
          <div className={`flex items-center gap-3 mb-8 justify-center lg:justify-start transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
              <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="2.5" opacity="0.3" />
              <path d="M14 32C14 32 16 20 24 16C32 12 36 24 36 24" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="24" cy="16" r="4" fill="#FBBF24" />
              <circle cx="14" cy="32" r="3" fill="white" />
              <circle cx="36" cy="24" r="3" fill="white" />
            </svg>
            <span className="text-3xl font-display font-bold text-white">MoPilot</span>
          </div>

          {/* Tagline with animated lightbulb */}
          <h1 className={`text-3xl lg:text-4xl font-display font-bold text-white leading-tight mb-6 transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Gemeinsam Ideen für{" "}
            <span className="bg-gradient-to-r from-accent-300 to-accent-400 bg-clip-text text-transparent">
              bessere Mobilität.
            </span>
          </h1>

          {/* Feature points */}
          <div className="space-y-4 mt-8">
            {features.map((f, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 justify-center lg:justify-start transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${400 + f.delay}ms` }}
              >
                <span className="text-2xl" aria-hidden="true">{f.icon}</span>
                <span className="text-white/90 font-body text-lg">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Foerderer */}
        <div className={`absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 transition-all duration-1000 delay-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <span className="text-white/30 text-xs font-body">Gefördert durch</span>
          <span className="text-white/30 text-xs font-body">BMDV</span>
          <span className="text-white/20">|</span>
          <span className="text-white/30 text-xs font-body">NOW GmbH</span>
        </div>
      </div>

      {/* Right panel – login form */}
      <div className="lg:w-[40%] flex items-center justify-center px-6 py-12 lg:py-0 bg-surface-50">
        <div className="w-full max-w-sm">
          {/* Small logo */}
          <div className="flex items-center gap-2 mb-8">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" stroke="#0F766E" strokeWidth="2.5" opacity="0.2" />
              <path d="M14 32C14 32 16 20 24 16C32 12 36 24 36 24" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="24" cy="16" r="4" fill="#F59E0B" />
              <circle cx="14" cy="32" r="3" fill="#0F766E" />
              <circle cx="36" cy="24" r="3" fill="#0F766E" />
            </svg>
            <span className="font-display font-bold text-lg text-primary-700">Ideenplattform</span>
          </div>

          <h2 className="text-2xl font-display font-bold text-surface-900 mb-1">
            Willkommen zurück
          </h2>
          <p className="text-surface-500 font-body text-sm mb-8">
            Melde dich an, um Ideen einzureichen und zu bewerten
          </p>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-4 text-sm font-body border border-red-200" role="alert">
              {error}
              {notVerified && (
                <button
                  onClick={handleResendVerification}
                  className="block mt-2 text-primary-600 font-medium hover:underline"
                >
                  Bestätigungsmail erneut senden
                </button>
              )}
            </div>
          )}

          {resendMessage && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-4 text-sm font-body border border-emerald-200">
              {resendMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5 font-body">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-surface-200 rounded-xl text-sm font-body bg-white text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200"
                placeholder="ihre@email.de"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5 font-body">
                Passwort
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-surface-200 rounded-xl text-sm font-body bg-white text-surface-800 placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200"
                  placeholder="Passwort eingeben"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors p-1"
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link
                  href="/passwort-vergessen"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
                >
                  Passwort vergessen?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold font-body rounded-xl hover:from-primary-700 hover:to-primary-800 hover:scale-[1.02] hover:shadow-warm-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-warm-sm"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Wird angemeldet...
                </span>
              ) : "Anmelden"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-surface-200" />
            <span className="text-xs text-surface-400 font-body">oder</span>
            <div className="flex-1 h-px bg-surface-200" />
          </div>

          <p className="text-center text-sm text-surface-500 font-body">
            Noch kein Konto?{" "}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors">
              Jetzt registrieren →
            </Link>
          </p>

          <p className="text-center text-xs text-surface-400 font-body mt-8">
            &copy; 2025 MoPilot Ideenplattform – Vianova eG
          </p>
        </div>
      </div>
    </div>
  );
}
