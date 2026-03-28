"use client";

import { AuthProvider } from "@/lib/auth";
import Header from "@/components/Header";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

const AUTH_PAGES = ["/login", "/register", "/passwort-vergessen", "/passwort-zuruecksetzen", "/verify"];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isAuthPage) {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <Header />
      <main id="main-content" className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-surface-200 bg-surface-50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h4 className="text-sm font-semibold text-surface-700 mb-4 font-display">
            Zugriffsrechte nach Kategorie
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-xl border-l-4 border-primary-500 p-4 shadow-warm-sm">
              <p className="font-medium text-surface-800 mb-1 font-body">Kundennah</p>
              <p className="text-surface-500 text-xs font-body">
                Endkunde, Stationspate, Hotline
              </p>
              <p className="text-surface-600 mt-2 text-xs font-body">
                Sieht und schreibt Ideen in <strong>Kundennah</strong>.
              </p>
            </div>
            <div className="bg-white rounded-xl border-l-4 border-blue-500 p-4 shadow-warm-sm">
              <p className="font-medium text-surface-800 mb-1 font-body">Betrieb</p>
              <p className="text-surface-500 text-xs font-body">
                Betreiber, Flottenmanagement, Fahrzeugbetreuer, Plattform-Support
              </p>
              <p className="text-surface-600 mt-2 text-xs font-body">
                Sieht und schreibt Ideen in <strong>Kundennah</strong> und{" "}
                <strong>Betrieb</strong>.
              </p>
            </div>
            <div className="bg-white rounded-xl border-l-4 border-accent-500 p-4 shadow-warm-sm">
              <p className="font-medium text-surface-800 mb-1 font-body">Strategie</p>
              <p className="text-surface-500 text-xs font-body">
                Projekttr&auml;ger, Fahrzeugsteller, Validierungsstelle
              </p>
              <p className="text-surface-600 mt-2 text-xs font-body">
                Sieht und schreibt Ideen in <strong>allen Kategorien</strong>.
              </p>
            </div>
          </div>
          <p className="text-xs text-surface-400 mt-4 font-body">
            Team- und Admin-Nutzer haben uneingeschr&auml;nkten Zugriff auf alle
            Rollen und Ideen.
          </p>
        </div>
      </footer>
    </AuthProvider>
  );
}
