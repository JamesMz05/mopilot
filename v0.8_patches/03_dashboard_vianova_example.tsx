// =============================================================================
// PATCH 03: Dashboard – "Beispiel Vianova Fahrzeugverwaltung" einfügen
// Ziel-Datei: /opt/mopilot/frontend/app/dashboard/page.tsx
//
// Änderung: Im Hauptfenster unter der Begrüßung wird ein neuer Abschnitt
// "Beispiel Vianova Fahrzeugverwaltung" mit Link und Screenshot eingefügt.
//
// Das Bild muss nach /opt/mopilot/frontend/public/images/ kopiert werden.
// =============================================================================

// --- EINZUFÜGENDER CODE-BLOCK ---
// Dieser Block wird NACH der Begrüßung (<h1>Willkommen...</h1>) eingefügt,
// aber VOR dem bestehenden Chat/Content-Bereich.
//
// Suche in dashboard/page.tsx nach dem Begrüßungstext und füge danach ein:

/*
  Finde in der bestehenden Datei den Abschnitt mit der Begrüßung, z.B.:

    <h1 className="...">Willkommen, {user?.name || 'Demo User'}</h1>
    <p className="...">Rollenbasiertes Demo Cockpit...</p>

  Füge DANACH folgenden JSX-Block ein:
*/

// ---- START: Neuer JSX-Block ----
const VianovaExampleSection = () => (
  <div className="mt-8 mb-8">
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-warm-lg border border-surface-200/50 overflow-hidden hover:shadow-warm-xl transition-shadow duration-300">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-primary-100/50 border-b border-surface-200/50">
        <h2 className="text-xl font-display font-semibold text-primary-800">
          Beispiel: Vianova Fahrzeugverwaltung
        </h2>
        <p className="text-sm text-surface-600 font-body mt-1">
          Das CC Fuhrpark Dashboard zeigt, wie digitale Fuhrparkverwaltung für Carsharing-Genossenschaften funktioniert.
        </p>
      </div>

      {/* Content with Image */}
      <div className="p-6">
        <a
          href="https://ccfuhrpark.vianova.website/"
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          {/* Screenshot */}
          <div className="rounded-xl overflow-hidden border border-surface-200 shadow-warm-sm group-hover:shadow-warm-md transition-shadow duration-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/260405_BeispielCCfuhrpark_dashboard.jpg"
              alt="CC Fuhrpark Dashboard – Fahrzeugverwaltung mit Terminen, Schäden und Live-Karte"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Link-Button */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-surface-600">
                Fahrzeuge, Termine, Schäden und Stationen – alles in einem Dashboard.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-warm-sm group-hover:shadow-warm-md group-hover:from-primary-700 group-hover:to-primary-800 transition-all duration-200 whitespace-nowrap">
              Dashboard öffnen
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          </div>
        </a>
      </div>
    </div>
  </div>
);
// ---- ENDE: Neuer JSX-Block ----

// Verwendung in der Dashboard-Page:
// Füge <VianovaExampleSection /> nach der Begrüßung ein.
// Alternativ kann der Code direkt inline in die JSX-Struktur eingefügt werden.

export { VianovaExampleSection };
