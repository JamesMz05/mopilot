// app/doku/workshops/page.tsx
// Overview page for workshops & projects

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workshops & Projekte — MoPilot",
  description:
    "MoPilot wirkt über den Prototyp hinaus: Workshops und Praxisprojekte für nachhaltige Mobilität im ländlichen Raum.",
};

interface Project {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  date: string;
  href: string;
}

const projects: Project[] = [
  {
    slug: "a-to-b",
    title: "A to B Mobilitäts-App",
    subtitle:
      "Schulprojekt der Klasse 10a, Pestalozzi-Gemeinschaftsschule Graben-Neudorf — von der Schüler-Vision zur installierbaren PWA.",
    badge: "🏆 1. Platz — New:Mobility Award 2026",
    image: "/doku/workshops/a-to-b/klasse-10a-award.jpg",
    date: "11. Juni 2026",
    href: "/doku/workshops/a-to-b",
  },
];

export default function WorkshopsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Zurück zur Startseite
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Workshops & Projekte
        </h1>
        <p className="text-gray-500 mb-8 max-w-2xl">
          MoPilot wirkt über den Prototyp hinaus: In Workshops und
          Praxisprojekten begleiten wir Schulen, Kommunen und Partner auf dem
          Weg zu nachhaltiger Mobilität im ländlichen Raum.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={project.href}
              className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <span className="inline-block text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full mb-3">
                  {project.badge}
                </span>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 mb-1">
                  {project.title}
                </h2>
                <p className="text-sm text-gray-500 mb-2">{project.subtitle}</p>
                <span className="text-xs text-gray-400">{project.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
