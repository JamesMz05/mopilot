// app/doku/workshops/a-to-b/page.tsx
// Detail page for the "A to B" New:Mobility Award 2026 project

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A to B Mobilitäts-App — MoPilot Workshops & Projekte",
  description:
    "Schulprojekt der Klasse 10a, Pestalozzi-Gemeinschaftsschule Graben-Neudorf. 1. Platz beim New:Mobility Award 2026.",
};

const IMG = "/doku/workshops/a-to-b";

const tocSections = [
  { id: "award", label: "Der New:Mobility Award" },
  { id: "projekt", label: "Das Projekt" },
  { id: "pwa", label: "Warum eine PWA?" },
  { id: "funktionen", label: "Die Funktionen" },
  { id: "sicherheit", label: "Eltern-Freigabe" },
  { id: "demo", label: "Live-Demo" },
  { id: "beteiligte", label: "Beteiligte & Dank" },
];

export default function AToB() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/doku/workshops"
          className="text-sm text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Zurück zu Workshops & Projekte
        </Link>

        {/* Hero */}
        <section className="mb-12">
          <span className="inline-block text-sm font-semibold bg-amber-100 text-amber-800 px-3 py-1 rounded-full mb-4">
            1. Platz · New:Mobility Award 2026
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            A to B Mobilitäts-App
          </h1>
          <p className="text-gray-500 mb-6 max-w-2xl">
            Ein Schulprojekt der Klasse 10a der
            Pestalozzi-Gemeinschaftsschule Graben-Neudorf — begleitet von der
            VIANOVA eG im Rahmen des MoPilot-Projekts.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href="https://fahrtwerk.vianova.website/app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              Live-Demo öffnen
            </a>
            <a
              href="https://fahrtwerk.vianova.website/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Projekt-Website
            </a>
          </div>
          <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-lg">
            <Image
              src={`${IMG}/klasse-10a-award.jpg`}
              alt="Klasse 10a mit E-Fahrzeug beim New:Mobility Award 2026"
              width={800}
              height={1067}
              className="w-full h-auto"
              priority
            />
          </div>
        </section>

        {/* Table of contents */}
        <nav className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Inhalt
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {tocSections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Section 1 — Der New:Mobility Award */}
        <section id="award" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Der New:Mobility Award
          </h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-3 mb-6">
            <p>
              Der New:Mobility Award ist ein Schulwettbewerb der Regionalen
              Wirtschaftsförderung Bruchsal GmbH (WFG) und des EfeuCampus
              Bruchsal. Er verbindet Berufsorientierung, Bildung für
              nachhaltige Entwicklung und MINT-Förderung: Schülerinnen und
              Schüler entwickeln in konkreten Projekten gemeinsam mit
              Unternehmen aus der Region Ideen für die Mobilität von morgen.
            </p>
            <p>
              Die Preisverleihung 2026 fand am 11. Juni 2026 im HubWerk01 in
              Bruchsal statt. Schirmherrin des Wettbewerbs war die
              Mobilitätsexpertin und Autorin Katja Diehl; die Prämierung nahm
              Oberbürgermeister Sven Weigt vor, Aufsichtsratsvorsitzender der
              Regionalen Wirtschaftsförderung Bruchsal. Die Laudatio auf das
              Siegerprojekt &bdquo;A to B&ldquo; hielt Prof. Dr. Hartmut
              Ayrle, vorgestellt wurde das Projekt von Matthias Leers
              (Marketing und Kommunikation, WFG).
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Mehr zum Wettbewerb:{" "}
            <a
              href="https://wfg-bruchsal.de/newmobility-award/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              wfg-bruchsal.de/newmobility-award
            </a>
          </p>

          {/* Fact card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Eckdaten
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-gray-400">Veranstalter</dt>
                <dd className="text-gray-800 font-medium">
                  WFG Bruchsal & EfeuCampus Bruchsal
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Schirmherrin</dt>
                <dd className="text-gray-800 font-medium">Katja Diehl</dd>
              </div>
              <div>
                <dt className="text-gray-400">Preisverleihung</dt>
                <dd className="text-gray-800 font-medium">
                  11.06.2026, HubWerk01 Bruchsal
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">Ergebnis</dt>
                <dd className="text-gray-800 font-medium">
                  1. Platz für &bdquo;A to B&ldquo;
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Section 2 — Das Projekt */}
        <section id="projekt" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Das Projekt: Von der Schüler-Vision zur App
          </h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-3 mb-6">
            <p>
              Die Klasse 10a der Pestalozzi-Gemeinschaftsschule Graben-Neudorf
              hatte einen klaren Wunsch: eine eigene Mobilitäts-App für ihren
              Ort. In Mindmaps und Plakaten entwickelten die Schülerinnen und
              Schüler ihre Vision eines vernetzten Mobilitäts-Sharings — mit
              Karte, Chats, Kalender, Buchung und einem Punktesystem, das
              klimafreundliche Wege belohnt.
            </p>
            <p>
              Die VIANOVA eG unterstützte die Klasse im Rahmen des
              MoPilot-Projekts dabei, diese Vision in ein umsetzbares Konzept
              und einen funktionierenden Prototyp zu übersetzen — die
              FahrtWerk-App.
            </p>
          </div>

          {/* Mindmap images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <figure>
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <Image
                  src={`${IMG}/mindmap-schueler-1.jpg`}
                  alt="Schüler-Mindmap: Chats, Kalender, Karte, Mieten, Punkte, Feedback"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </figure>
            <figure>
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <Image
                  src={`${IMG}/mindmap-schueler-2.jpg`}
                  alt="Schüler-Plakat: Mobilitäts-Sharing"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </figure>
          </div>
          <p className="text-xs text-gray-400 text-center mb-8">
            Die Original-Mindmaps der Klasse 10a
          </p>

          {/* Concept infographic */}
          <figure className="mb-6">
            <div className="relative rounded-xl overflow-hidden shadow-sm">
              <Image
                src={`${IMG}/konzept-vernetzte-mobilitaet.jpg`}
                alt="Das Gesamtkonzept: Multimodales Sharing, eine smarte App, Gamification und Sicherheit"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
            <figcaption className="text-xs text-gray-400 text-center mt-2">
              Das Gesamtkonzept: Multimodales Sharing, eine smarte App,
              Gamification und Sicherheit
            </figcaption>
          </figure>

          {/* 4 concept cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Multimodales Sharing für alle",
                text: "E-Bikes, E-Roller und E-Autos (ab 18 bzw. mit Führerschein), verknüpft mit Bus und Bahn — alles in einem System.",
              },
              {
                title: "Alles in einer smarten App",
                text: "Karte, Buchung, Kalender-Synchronisation und Chats zentral gebündelt.",
              },
              {
                title: "Gamification: Kilometer gegen Punkte",
                text: "Punkte pro klimafreundlich zurückgelegtem Kilometer, einlösbar als Rabatte und Freifahrten.",
              },
              {
                title: "Sicherheit & Gemeinschaft im Fokus",
                text: "Notfall-Chat, Helm-Sharing, Eltern-Freigabe und Stationen dort, wo Leben stattfindet: an Schulen, Sportplätzen und Treffpunkten.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500">{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 — Warum eine PWA? */}
        <section id="pwa" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Warum eine PWA?
          </h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-3 mb-6">
            <p>
              Eine klassische native App hätte für ein agiles Schulprojekt
              entscheidende Nachteile: App-Store-Freigabeprozesse, doppelte
              Entwicklung für iOS und Android und eine Installations-Hürde für
              die Nutzer. Die Lösung: eine Progressive Web App (PWA) — im Kern
              eine Website, die sich wie eine App anfühlt.
            </p>
            <p>
              Die FahrtWerk-PWA läuft sofort im Browser (ein QR-Code genügt),
              lässt sich mit einem Tipp auf den Startbildschirm installieren
              und funktioniert dank Service Worker und lokalem Cache auch
              offline — etwa wenn das Netz am Bahnhof Graben-Neudorf mal
              schwächelt. Updates erreichen alle Nutzer sofort, ganz ohne App
              Store.
            </p>
          </div>

          <figure>
            <div className="relative rounded-xl overflow-hidden shadow-sm max-w-2xl">
              <Image
                src={`${IMG}/pwa-technologie-vergleich.jpg`}
                alt="Technologie-Vergleich: Website, PWA und native App"
                width={1000}
                height={600}
                className="w-full h-auto"
              />
            </div>
            <figcaption className="text-xs text-gray-400 mt-2">
              Technologie-Vergleich: Website, PWA und native App
            </figcaption>
          </figure>
        </section>

        {/* Section 4 — Die Funktionen */}
        <section id="funktionen" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Die Funktionen
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Per Feature-Triage destillierte das Team die Mindmaps auf ein
            Minimum Viable Product (MVP) — schnell umsetzbar, sofort nutzbar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Phase 1 */}
            <div className="bg-white border-2 border-green-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-green-700 mb-3">
                Phase 1 — Das MVP (live)
              </h3>
              <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                <li>Einmalige Registrierung</li>
                <li>Interaktive Karte mit Fahrzeugen, Stationen und Events</li>
                <li>Mieten: Fahrzeugauswahl und Buchung</li>
                <li>Community-Chats</li>
                <li>Simulierte Eltern-Freigabe für minderjährige Nutzer</li>
                <li>Installierbar auf dem Startbildschirm, offline-fähig</li>
              </ul>
            </div>
            {/* Phase 2 */}
            <div className="bg-white border-2 border-blue-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-blue-700 mb-3">
                Phase 2 — Der Ausblick
              </h3>
              <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                <li>
                  Gamification: Punkte pro Kilometer, Rabatte und Freifahrten
                </li>
                <li>KI-gestützte Community-Chats</li>
                <li>Premium-Erklärvideos</li>
                <li>Kalender-Synchronisation</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <figure>
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <Image
                  src={`${IMG}/feature-triage-phasen.jpg`}
                  alt="Feature-Triage: MVP Phase 1 vs. Phase 2"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <figcaption className="text-xs text-gray-400 mt-2">
                Feature-Triage: MVP Phase 1 vs. Phase 2
              </figcaption>
            </figure>
            <figure>
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <Image
                  src={`${IMG}/screenshot-app.jpg`}
                  alt="FahrtWerk-App mit Live-Karte (Smartphone-Mockup)"
                  width={400}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
              <figcaption className="text-xs text-gray-400 mt-2">
                FahrtWerk-App mit Live-Karte
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Section 5 — Sicherheit: Die Eltern-Freigabe */}
        <section id="sicherheit" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sicherheit: Die Eltern-Freigabe
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Viele der künftigen Nutzerinnen und Nutzer sind minderjährig.
            Deshalb gehört zur FahrtWerk-App eine simulierte Eltern-Freigabe:
            Eltern bestätigen die Nutzung, bevor Jugendliche Fahrzeuge buchen
            können. Die Demo zeigt den kompletten Ablauf.
          </p>

          <figure className="mb-6">
            <div className="relative rounded-xl overflow-hidden shadow-sm max-w-md">
              <Image
                src={`${IMG}/screenshot-elternfreigabe.jpg`}
                alt="Eltern-Freigabe-Ansicht der FahrtWerk-App"
                width={400}
                height={800}
                className="w-full h-auto"
              />
            </div>
          </figure>

          <a
            href="https://fahrtwerk.vianova.website/app/eltern"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:underline"
          >
            Eltern-Freigabe ansehen →
          </a>
        </section>

        {/* Section 6 — Live-Demo */}
        <section id="demo" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Live-Demo</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              {
                title: "FahrtWerk-App",
                desc: "Die PWA mit Karte, Buchung und Chats",
                href: "https://fahrtwerk.vianova.website/app",
                img: `${IMG}/screenshot-app.jpg`,
                alt: "FahrtWerk-App Screenshot",
              },
              {
                title: "Eltern-Freigabe",
                desc: "Der simulierte Freigabe-Prozess",
                href: "https://fahrtwerk.vianova.website/app/eltern",
                img: `${IMG}/screenshot-elternfreigabe.jpg`,
                alt: "Eltern-Freigabe Screenshot",
              },
              {
                title: "Projekt-Website",
                desc: "Hintergründe, Stationen und Konzept",
                href: "https://fahrtwerk.vianova.website/",
                img: `${IMG}/screenshot-website.jpg`,
                alt: "FahrtWerk Projekt-Website Screenshot",
              },
            ].map((demo) => (
              <a
                key={demo.title}
                href={demo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="relative aspect-[3/4] bg-gray-100">
                  <Image
                    src={demo.img}
                    alt={demo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 mb-1">
                    {demo.title}
                  </h3>
                  <p className="text-xs text-gray-500">{demo.desc}</p>
                </div>
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400 italic">
            Die Demo ist ein Prototyp aus dem Schulprojekt — Buchungen und
            Freigaben sind simuliert.
          </p>
        </section>

        {/* Section 7 — Beteiligte & Dank */}
        <section id="beteiligte" className="mb-12 scroll-mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Beteiligte & Dank
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-sm text-gray-600 leading-relaxed space-y-3 mb-6">
            <p>
              <strong>Projekt:</strong> Klasse 10a der
              Pestalozzi-Gemeinschaftsschule Graben-Neudorf ·{" "}
              <strong>Begleitung & Umsetzung:</strong> VIANOVA eG im Rahmen des
              MoPilot-Projekts · <strong>Wettbewerb:</strong> Regionale
              Wirtschaftsförderung Bruchsal GmbH (WFG) und EfeuCampus Bruchsal.
            </p>
            <p>
              Herzlichen Glückwunsch an die Klasse 10a zum 1. Platz — und
              danke an alle, die das Projekt möglich gemacht haben!
            </p>
          </div>

          <figure className="mb-8">
            <div className="relative rounded-xl overflow-hidden shadow-sm max-w-lg">
              <Image
                src={`${IMG}/schild-nachhaltige-mobilitaet.jpg`}
                alt="Ortsschild: Nachhaltige Mobilität gemeinsam organisieren"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </figure>

          <Link
            href="/doku/workshops"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Zurück zu Workshops & Projekte
          </Link>
        </section>
      </div>
    </div>
  );
}
