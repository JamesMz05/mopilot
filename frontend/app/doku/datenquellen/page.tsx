// app/doku/datenquellen/page.tsx

import Link from "next/link";

const quellen = [
  {
    nr: 1,
    name: "Info Portal",
    url: "https://info.evemo.de/",
    zugang: "Passwortgeschützt",
    aufgabe: "Zentrale Wissensbasis für Betreiber: Anleitungen, Arbeitsprozesse, Plattform-Dokumentation",
    inhalte: ["Einrichtung Sharingsystem", "Flottenmanagement", "Kundenservice", "Schadenmanagement", "Sharing Administration", "Hardwareinstallation", "Software-Releases"],
    rollen: ["Betreiber", "Plattform-Support", "Flottenmanagement", "Fahrzeugbetreuer"],
    farbe: "blue",
  },
  {
    nr: 2,
    name: "Projektwebseite",
    url: "https://mopilot.website/",
    zugang: "Öffentlich",
    aufgabe: "Verträge, AGB, Nutzungsanleitungen, FAQs, Fahrzeughandbücher",
    inhalte: ["AGB & Verträge", "Nutzungsanleitungen (Sharing App, Portal, RFID)", "Fahrzeughandbücher", "FAQs für Endkunden"],
    rollen: ["Endkunde", "Stationspate", "Hotline", "Validierungsstelle", "Fahrzeugsteller"],
    farbe: "green",
  },
  {
    nr: 3,
    name: "Kundenbetreuungssystem",
    url: "https://support.evemo.de/",
    zugang: "Intern",
    aufgabe: "Ticketsystem für Kundenanfragen und Support-Kommunikation",
    inhalte: ["Eingehende Kundenanfragen", "Bisherige Antworten & Lösungen", "Eskalationsverlauf"],
    rollen: ["Hotline", "Plattform-Support", "Betreiber", "Stationspate"],
    farbe: "orange",
  },
  {
    nr: 4,
    name: "Admin Center + Provider Portal",
    url: "Intern (Coolify)",
    zugang: "Intern – operativ kritisch",
    aufgabe: "Echtzeit-Betriebsdaten: Stationen, Fahrzeuge, Buchungen, Tarife, Einnahmen",
    inhalte: ["Stationen & Standorte", "Fahrzeuge & Fahrzeugmodelle", "Buchungen & Buchungssperren", "Tarife & Einnahmen pro Buchung"],
    rollen: ["Betreiber", "Flottenmanagement", "Fahrzeugbetreuer", "Projektträger"],
    farbe: "red",
  },
  {
    nr: 5,
    name: "Umgebungsinformationen",
    url: "Verschiedene öffentliche Quellen",
    zugang: "In Evaluierung ⚠️",
    aufgabe: "Öffentlich zugängliche Kontextdaten zur Standort- und Bedarfsanalyse",
    inhalte: ["ÖPNV-Daten", "Demografische Daten", "POIs & Infrastruktur", "Pendlerströme"],
    rollen: ["Betreiber", "Projektträger", "Kommunen"],
    farbe: "gray",
  },
];

const farbKlassen: Record<string, { card: string; badge: string; nr: string }> = {
  blue:   { card: "border-blue-200",   badge: "bg-blue-100 text-blue-700",     nr: "bg-blue-600 text-white" },
  green:  { card: "border-green-200",  badge: "bg-green-100 text-green-700",   nr: "bg-green-600 text-white" },
  orange: { card: "border-orange-200", badge: "bg-orange-100 text-orange-700", nr: "bg-orange-500 text-white" },
  red:    { card: "border-red-200",    badge: "bg-red-100 text-red-700",       nr: "bg-red-600 text-white" },
  gray:   { card: "border-gray-200",   badge: "bg-gray-100 text-gray-600",     nr: "bg-gray-500 text-white" },
};

export default function DatenquellenPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Zurück zur Startseite
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🗄️ Datenquellen</h1>
        <p className="text-gray-500 mb-8">
          MoPilot greift auf 5 Informationsquellen zurück. Bei Anfragen wird jeweils
          die passende Quelle priorisiert.
        </p>

        <div className="space-y-5">
          {quellen.map((q) => {
            const f = farbKlassen[q.farbe];
            return (
              <div key={q.nr} className={`bg-white border-2 ${f.card} rounded-xl p-6 shadow-sm`}>
                <div className="flex items-start gap-4">
                  <span className={`${f.nr} text-lg font-bold w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0`}>
                    {q.nr}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h2 className="text-lg font-semibold text-gray-800">{q.name}</h2>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border">
                        {q.zugang}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{q.aufgabe}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Inhalte</p>
                        <ul className="space-y-1">
                          {q.inhalte.map((i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center gap-1">
                              <span className="text-gray-300">›</span> {i}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Genutzt von</p>
                        <div className="flex flex-wrap gap-1">
                          {q.rollen.map((r) => (
                            <span key={r} className={`text-xs px-2 py-1 rounded-full font-medium ${f.badge}`}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          ⚠️ <strong>Hinweis Quelle 5:</strong> Umgebungsinformationen sind noch in Evaluierung –
          Antworten auf dieser Basis gelten als vorläufig.
        </div>
      </div>
    </div>
  );
}
