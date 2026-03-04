// components/DokuSection.tsx
// Neuer Bereich "MoPilot Projekt Doku" – über DemoHinweise einfügen

import Link from "next/link";

const dokuLinks = [
  {
    href: "/doku/rollen",
    title: "Rollen",
    description: "Alle Nutzerrollen im Überblick: Endkunde, Betreiber, Hotline und mehr.",
    icon: "👥",
  },
  {
    href: "/doku/datenquellen",
    title: "Datenquellen",
    description: "Info Portal, Admin Center, Ticketsystem und weitere Informationsquellen.",
    icon: "🗄️",
  },
  {
    href: "/doku/prototyp",
    title: "Prototyp Doku",
    description: "Technische Architektur, IT-Umfeld und Deployment des Prototyp v0.2.",
    icon: "🛠️",
  },
];

export default function DokuSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">
        📄 MoPilot Projekt Doku
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Projektdokumentation, Rollen und technische Hintergründe
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {dokuLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col gap-1 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="font-medium text-gray-800 group-hover:text-blue-700">
              {link.title}
            </span>
            <span className="text-xs text-gray-500 leading-snug">
              {link.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
