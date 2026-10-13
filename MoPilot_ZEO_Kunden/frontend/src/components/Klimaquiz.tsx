'use client'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

// Klimaquiz "Teste dein Wissen" – portable game from the Vianova package
// (web_design/zeo-carsharing_de/klimaquiz-paket/, see EINBAU.md).
// The game itself lives unchanged in public/klimaquiz/; only the config below is ZEO-specific.

declare global {
  interface Window {
    Klimaquiz?: { starten: (el: HTMLElement, k?: object) => void }
  }
}

const KONFIG = {
  name: 'ZEO-Klimaquiz',
  statistik: `${process.env.NEXT_PUBLIC_BACKEND_URL ?? ''}/api/klimaquiz/statistik`,
  speicher: 'zeo-kunden-quiz-bestes',
  markeKurz: 'ZEO',
  hinweise: { autofrei: 'Mit ZEO: Auto nutzen statt besitzen', eauto: 'Alle ZEOs fahren elektrisch' },
  band: {
    titel: 'Ihr größter Hebel: das Auto',
    text: 'Mit ZEO brauchen viele keinen Zweitwagen mehr – elektrisch mit Ökostrom.',
    knoepfe: [
      { text: 'Station finden', href: 'https://www.zeo-carsharing.de/stationen' },
      { text: 'Jetzt registrieren', href: 'https://mein.zeo-carsharing.de/start' },
    ],
  },
  anker: 'teste-dein-wissen',
}

// Fallback without JavaScript: all 19 measures (kg CO2e per person and year, values from klimaquiz.js)
const MASSNAHMEN: [string, number][] = [
  ['Autofrei leben', 2400],
  ['Einen Transatlantikflug vermeiden', 1600],
  ['Ökostrom beziehen', 1300],
  ['Auf ein E-Auto umsteigen', 1200],
  ['Ein effizienteres Auto kaufen', 1200],
  ['Pflanzliche Ernährung', 800],
  ['Auf ein Hybrid-Auto umsteigen', 400],
  ['Lebensmittelabfälle vermeiden', 370],
  ['Wäsche kalt waschen', 240],
  ['Weniger Fleisch essen', 230],
  ['Energie sparen im Haushalt', 210],
  ['Konsequent recyceln', 210],
  ['Wäsche an der Luft trocknen', 210],
  ['Heiz- und Kühleffizienz', 180],
  ['Regional essen', 180],
  ['Smart-Thermostat einbauen', 180],
  ['Glühbirnen gegen LEDs tauschen', 100],
  ['Einen Baum pflanzen', 30],
  ['Einkaufstasche wiederverwenden', 5],
]

export default function Klimaquiz() {
  const ref = useRef<HTMLDivElement>(null)
  const [geladen, setGeladen] = useState(false)

  useEffect(() => {
    // starten() guards against double start itself (data-klimaquiz-laeuft), so StrictMode is fine
    if ((geladen || window.Klimaquiz) && ref.current && window.Klimaquiz) {
      window.Klimaquiz.starten(ref.current, KONFIG)
    }
  }, [geladen])

  return (
    <>
      <link rel="stylesheet" href="/klimaquiz/klimaquiz.css" />
      {/* No data-klimaquiz attribute: the script must not autostart; React keeps this div empty */}
      <div ref={ref} className="klimaquiz" id="teste-dein-wissen" style={{ scrollMarginTop: '5rem' }} />
      <noscript>
        <table className="w-full text-sm border-collapse">
          <caption className="text-left font-semibold mb-2">
            Was spart wirklich CO₂? Einsparung pro Person und Jahr
          </caption>
          <thead>
            <tr className="border-b">
              <th className="text-left py-1" scope="col">Maßnahme</th>
              <th className="text-right py-1" scope="col">kg CO₂e</th>
            </tr>
          </thead>
          <tbody>
            {MASSNAHMEN.map(([name, wert]) => (
              <tr key={name} className="border-b border-gray-100">
                <td className="py-1">{name}</td>
                <td className="py-1 text-right">{wert.toLocaleString('de-DE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </noscript>
      <Script src="/klimaquiz/klimaquiz.js" strategy="afterInteractive" onLoad={() => setGeladen(true)} />
    </>
  )
}
