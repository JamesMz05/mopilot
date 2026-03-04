export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🤖</span>
            <h1 className="text-xl font-bold tracking-tight">MoPilot</h1>
          </a>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-indigo-900 mb-8">Impressum</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-8 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Angaben gemäß § 5 TMG</h2>
            <p><strong>Vianova eG</strong><br />
            Anni-Eisler-Lehmann-Str. 3<br />
            55122 Mainz</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Vertreten durch den Vorstand</h2>
            <p>Klaus Grieger, Carsten Jansing, Reinhard Sczech</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Aufsichtsrat</h2>
            <p>
              <strong>Vorsitzender:</strong> Gerhard Baumeister<br />
              <strong>Stellvertretende Vorsitzende:</strong> Almut Petersen, Peter Kania
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Kontakt</h2>
            <p>
              E-Mail: <a href="mailto:info@vianova.coop" className="text-indigo-600 hover:underline">info@vianova.coop</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p>Reinhard Sczech<br />
            Anni-Eisler-Lehmann-Str. 3<br />
            55122 Mainz</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Hinweis zum Dienst</h2>
            <p>
              MoPilot ist ein KI-gestützter Prototyp (v0.1) für rollenbasiertes Carsharing-Management.
              Die Plattform wird betrieben von der <strong>Vianova eG</strong> in Kooperation mit dem
              ZEO Carsharing (Regionale Wirtschaftsförderung Bruchsal GmbH).
              Es handelt sich um eine Demo-Version, die ausschließlich für autorisierte Testzwecke zugänglich ist.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Haftung für Inhalte</h2>
            <p>
              Die Inhalte dieser Demo-Plattform wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              Als Betreiber sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
              allgemeinen Gesetzen verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Urheberrecht</h2>
            <p>
              Die durch die Betreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
              Urheberrecht. Vervielfältigung, Bearbeitung und Verbreitung bedürfen der schriftlichen Zustimmung
              der Vianova eG.
            </p>
          </section>
        </div>

        <div className="mt-6 text-center">
          <a href="/datenschutz" className="text-indigo-600 hover:underline text-sm">→ Zur Datenschutzerklärung</a>
        </div>
      </main>
    </div>
  )
}
