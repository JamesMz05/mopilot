"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function Header() {
  const { user, token, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.user_type === "admin" && token) {
      apiFetch<{ count: number }>("/users/pending-count", { token })
        .then((p) => setPendingCount(p.count))
        .catch(() => {});
    }
  }, [user, token]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b transition-shadow duration-300 ${
          scrolled ? "shadow-warm-md border-surface-200/50" : "border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" className="transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
              <circle cx="24" cy="24" r="22" stroke="#0F766E" strokeWidth="2.5" opacity="0.2" />
              <path d="M14 32C14 32 16 20 24 16C32 12 36 24 36 24" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="24" cy="16" r="4" fill="#F59E0B" />
              <circle cx="14" cy="32" r="3" fill="#0F766E" />
              <circle cx="36" cy="24" r="3" fill="#0F766E" />
            </svg>
            <div>
              <span className="font-display font-bold text-primary-800 text-lg">Ideenplattform</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Hauptnavigation">
            <Link href="/" className="relative px-3 py-2 text-sm font-medium font-body text-surface-600 hover:text-primary-700 transition-colors group">
              Ideen
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </Link>
            {user && (
              <Link href="/" className="relative px-3 py-2 text-sm font-medium font-body text-surface-600 hover:text-primary-700 transition-colors group">
                Meine Ideen
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              </Link>
            )}
            {user?.user_type === "admin" && (
              <Link href="/admin" className="relative px-3 py-2 text-sm font-medium font-body text-surface-600 hover:text-primary-700 transition-colors group inline-flex items-center">
                Admin
                {pendingCount > 0 && (
                  <span className="ml-1 bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                )}
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-100 transition-colors" aria-label="Benutzermenu">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold font-body flex-shrink-0">
                    {initials}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-surface-700 font-body max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400 hidden md:block"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-warm-lg border border-surface-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-3 py-2 border-b border-surface-100">
                    <p className="text-sm font-medium text-surface-800 font-body truncate">{user.name}</p>
                    <p className="text-xs text-surface-500 font-body">{user.role_name || user.user_type}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm text-surface-600 hover:bg-surface-50 hover:text-red-600 transition-colors font-body flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Abmelden
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium font-body text-surface-600 hover:text-primary-700 transition-colors">
                  Anmelden
                </Link>
                <Link href="/register" className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold font-body rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-warm-md transition-all duration-200">
                  Registrieren
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors"
              aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-700"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-700"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="fixed top-16 right-0 bottom-0 w-72 bg-white/95 backdrop-blur-md shadow-warm-xl z-40 lg:hidden animate-slide-in-right overflow-y-auto">
            <nav className="p-4 space-y-1" aria-label="Mobile Navigation">
              <Link href="/" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium font-body text-surface-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors">
                Ideen
              </Link>
              {user?.user_type === "admin" && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3 text-sm font-medium font-body text-surface-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors">
                  Admin
                  {pendingCount > 0 && (
                    <span className="ml-1 bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                  )}
                </Link>
              )}
              {user ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full mt-3 px-4 py-3 text-sm font-medium font-body text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Abmelden
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium font-body text-surface-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors">
                    Anmelden
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="block mt-2 px-4 py-3 text-sm font-semibold font-body text-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                    Registrieren
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}

      <div className="h-16" />
    </>
  );
}
