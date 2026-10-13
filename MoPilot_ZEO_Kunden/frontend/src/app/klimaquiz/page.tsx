import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Klimaquiz from '@/components/Klimaquiz'

export const metadata: Metadata = {
  title: 'Klimaquiz – Was spart wirklich CO₂? | ZEO Kundenassistent',
  description:
    'Drei kurze Runden: Duell, Schätzen, Reihenfolge. Testen Sie, welche Alltagsentscheidungen wirklich CO₂ sparen – und welche Rolle das Auto spielt.',
}

export default function KlimaquizPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-8">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="klimaquiz-titel">
          <p className="text-sm font-semibold text-zeo-600 uppercase tracking-wider mb-2">Klimaquiz</p>
          <h1 id="klimaquiz-titel" className="text-3xl sm:text-4xl font-bold text-zeo-900 mb-3">
            Teste dein Wissen
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl">
            Was spart wirklich CO₂ – und welche Rolle spielt das Auto? Drei kurze Runden, etwa drei Minuten.
          </p>

          <Klimaquiz />

          <div className="mt-8 space-y-2 text-sm text-gray-500">
            <p>
              Datengrundlage: Wynes &amp; Nicholas (2017), <em>The climate mitigation gap</em>, Environmental
              Research Letters 12, 074024. Werte in kg CO₂-Äquivalent, die eine Person in einem Industrieland pro
              Jahr einspart.
            </p>
            <p>
              Datenschutz: Das Quiz setzt keine Cookies und nutzt keine Drittanbieter. Für „So haben andere
              getippt“ zählen wir nur Summen über alle beendeten Spiele – ohne IP-Adresse und ohne Einzelantworten.
              Ihr bestes Ergebnis merkt sich nur Ihr Browser. Details in der{' '}
              <a href="https://mopilot.website/datenschutz" className="underline hover:text-zeo-700">
                Datenschutzerklärung
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
