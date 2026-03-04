// app/doku/prototyp/page.tsx

import Link from "next/link";

const techStack = [
  { schicht: "Frontend",         tech: "Next.js 14",          detail: "Node 20, TailwindCSS, Leaflet.js" },
  { schicht: "Backend",          tech: "FastAPI",              detail: "Python 3.11, Anthropic SDK, SSE-Streaming" },
  { schicht: "KI-Modell",        tech: "Claude Sonnet",        detail: "Anthropic Cloud API, rollenspez. System-Prompts" },
  { schicht: "Datenbank",        tech: "PostgreSQL :5432",     detail: "User, ChatMessages, Stations, Vehicles, Tariffs, FAQs" },
  { schicht: "Cache",            tech: "Redis :6379",          detail: "Session-Verwaltung" },
  { schicht: "Authentifizierung",tech: "JWT",                  detail: "8h Token-Gültigkeit, bcrypt Passwort-Hashing" },
  { schicht: "Infrastruktur",    tech: "Hetzner CX33",         detail: "Server IP: 142.132.232.211" },
  { schicht: "Deployment",       tech: "Coolify",              detail: "Docker Compose, Auto-SSL, Health Checks" },
  { schicht: "CI/CD",            tech: "GitHub Actions",       detail: "Auto-Deploy bei Push auf master (~90 Sek.)" },
  { schicht: "DNS",              tech: "IONOS",                detail: "A-Records für mopilot.website Subdomains" },
];

const subProjekte = [
  {
    status: "✅ Live",
    farbe: "green",
    name: "zeo-kunden.mopilot.website",
    beschreibung: "Öffentlicher Endkunden-Assistent für ZEO Carsharing. Entwickelt in einer einzigen Claude Code Session (35 Dateien, 2.736 Codezeilen).",
    seit: "1. März 2026",
  },
  {
    status: "🔜 Geplant",
    farbe: "blue",
    name: "hotline.mopilot.website",
    beschreibung: "Internes Tool für Hotline-Mitarbeiter (Vianova eG). Zweispaltiges Layout, Gesprächsleitfaden, Dunkel-Modus. Geschätzter Aufwand: 3–4 Tage.",
    seit: "In Planung",
  },
];

export default function PrototypPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Zurück zur Startseite
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">🛠️ Prototyp Dokumentation</h1>
        <p className="text-gray-400 text-sm mb-1">Version 0.2 · Stand: 1. März 2026</p>
        <p className="text-gray-500 mb-8">
          Technische Architektur, IT-Umfeld und Deployment des MoPilot-Prototyps.
          Betreiber: ZEO Carsharing (Region Bruchsal) + Car&amp;RideSharing Community eG (cc)
        </p>

        {/* Systemarchitektur */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Systemarchitektur</h2>
          <div className="bg-gray-900 text-green-400 rounded-xl p-5 font-mono text-xs leading-relaxed overflow-x-auto">
            <pre>{`NUTZER (Browser)
mopilot.website / zeo-kunden.mopilot.website
        │ HTTPS
        ▼
HETZNER CX33 (142.132.232.211)
  └── COOLIFY / Traefik (Reverse Proxy, SSL via Let's Encrypt)
        ├── FRONTEND  – Next.js 14 :3000
        └── BACKEND   – FastAPI :8000
              ├── PostgreSQL :5432
              └── Redis :6379
                    │
              ANTHROPIC CLOUD API
              Claude Sonnet (rollenspez. System-Prompt)`}</pre>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tech Stack</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Schicht</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Technologie</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Details</th>
                </tr>
              </thead>
              <tbody>
                {techStack.map((row, i) => (
                  <tr key={row.schicht} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-gray-500">{row.schicht}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.tech}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* API Endpunkte */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Backend API-Endpunkte</h2>
          <div className="bg-gray-900 text-green-400 rounded-xl p-5 font-mono text-xs leading-relaxed">
            <pre>{`POST /api/auth/login     → JWT-Token (8h Gültigkeit)
POST /api/chat/send      → KI-Antwort (rollenspezifisch + Chat-History)
GET  /api/knowledge/     → Wissensbasis / FAQs
GET  /api/stations/      → Stationsdaten
GET  /api/vehicles/      → Fahrzeugdaten
GET  /api/tariffs/       → Tarife
GET  /api/health         → {"status": "ok"}`}</pre>
          </div>
        </section>

        {/* CI/CD */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">CI/CD Pipeline</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-3">
              Vollautomatisch via GitHub Actions. Trigger: Push auf <code className="bg-gray-100 px-1 rounded">master</code>-Branch. Dauer: ~60–90 Sekunden.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {["git push", "→ GitHub Actions", "→ SSH auf Hetzner", "→ git pull", "→ Coolify Rebuild", "→ LIVE"].map((step, i) => (
                <span key={i} className={`px-3 py-1 rounded-full font-medium ${i === 5 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {step}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Sub-Projekte */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sub-Projekte</h2>
          <div className="space-y-4">
            {subProjekte.map((p) => (
              <div key={p.name} className={`bg-white border-2 rounded-xl p-5 shadow-sm ${p.farbe === "green" ? "border-green-200" : "border-blue-200"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold">{p.status}</span>
                  <code className="text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">{p.name}</code>
                  <span className="text-xs text-gray-400 ml-auto">{p.seit}</span>
                </div>
                <p className="text-sm text-gray-600">{p.beschreibung}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Datenbasis */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Datenbasis (ZEO)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { file: "vehicles.json", inhalt: "9 Fahrzeugmodelle", icon: "🚗" },
              { file: "tariffs.json",  inhalt: "2 Tarife (eco, eco plus)", icon: "💶" },
              { file: "stations.json", inhalt: "12 Musterstationen", icon: "📍" },
              { file: "faq.json",      inhalt: "18 FAQs in 3 Kategorien", icon: "❓" },
            ].map((d) => (
              <div key={d.file} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl mb-1">{d.icon}</div>
                <div className="text-xs font-mono text-gray-500">{d.file}</div>
                <div className="text-xs text-gray-600 mt-1">{d.inhalt}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
