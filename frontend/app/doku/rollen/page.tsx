// app/doku/rollen/page.tsx

import Link from "next/link";

const rollen = [
  {
    kategorie: "Kundennah",
    farbe: "blue",
    items: [
      {
        rolle: "Endkunde",
        aufgabe: "Carsharing optimal und entspannt nutzen",
        beispiele: ["Fahrzeug finden & buchen", "Tarife & Kosten", "Stornierung", "Probleme melden"],
      },
      {
        rolle: "Stationspate",
        aufgabe: "Standortbetreuung & Onboarding vor Ort",
        beispiele: ["Interessenten beraten", "Fahrzeugeigenschaften erklären", "Infoveranstaltungen kommunizieren"],
      },
      {
        rolle: "Hotline",
        aufgabe: "Kundenunterstützung bei Problemen & Fragen",
        beispiele: ["Gesprächsleitfaden", "Fahrzeug-Bedienung", "Eskalationspfade"],
      },
    ],
  },
  {
    kategorie: "Betrieb",
    farbe: "green",
    items: [
      {
        rolle: "Betreiber",
        aufgabe: "Durchführung des Sharing-Betriebs",
        beispiele: ["Tarifänderungen", "Fuhrpark-Optimierung", "Fehlersuche"],
      },
      {
        rolle: "Flottenmanagement",
        aufgabe: "Stations- & Fahrzeugprozesse",
        beispiele: ["Neue Fahrzeuge integrieren", "Schwachstellenanalyse", "Vorbeugende Wartung"],
      },
      {
        rolle: "Fahrzeugbetreuer",
        aufgabe: "Reinigung, Wartung & Reparatur",
        beispiele: ["Werkstatttermine", "HU/Inspektion planen", "Fahrzeug einweisen"],
      },
      {
        rolle: "Plattform-Support",
        aufgabe: "Technischer Betrieb & Tickets",
        beispiele: ["Systemausfälle erkennen", "Betreiber informieren", "Fehleranalyse"],
      },
    ],
  },
  {
    kategorie: "Strategie",
    farbe: "purple",
    items: [
      {
        rolle: "Projektträger",
        aufgabe: "Projektstrategie & -entwicklung",
        beispiele: ["KPIs & Förderung", "Kundenakquise", "Projektpartner finden"],
      },
      {
        rolle: "Fahrzeugsteller",
        aufgabe: "Fahrzeugbereitstellung & -management",
        beispiele: ["Übergabe dokumentieren", "Versicherungsstatus", "Reparaturoptimierung"],
      },
      {
        rolle: "Validierungsstelle",
        aufgabe: "Führerscheinprüfung & Kundendaten",
        beispiele: ["Dokumente prüfen", "Konto freischalten", "Vertragsfragen"],
      },
    ],
  },
];

const farbKlassen: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  green: "bg-green-50 border-green-200 text-green-800",
  purple: "bg-purple-50 border-purple-200 text-purple-800",
};

const badgeKlassen: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
};

export default function RollenPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Zurück zur Startseite
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Rollen</h1>
        <p className="text-gray-500 mb-8">
          MoPilot adressiert 10 Nutzerrollen in 3 Kategorien. Jede Rolle erhält
          einen individuell angepassten KI-Kontext.
        </p>

        {/* Kategorien */}
        {rollen.map((kat) => (
          <div key={kat.kategorie} className="mb-8">
            <h2 className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border mb-4 ${farbKlassen[kat.farbe]}`}>
              {kat.kategorie}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kat.items.map((item) => (
                <div key={item.rolle} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{item.rolle}</h3>
                  <p className="text-sm text-gray-500 mb-3">{item.aufgabe}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.beispiele.map((b) => (
                      <span key={b} className={`text-xs px-2 py-1 rounded-full font-medium ${badgeKlassen[kat.farbe]}`}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
