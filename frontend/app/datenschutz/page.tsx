export default function DatenschutzPage() {
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
        <h1 className="text-3xl font-bold text-indigo-900 mb-8">Datenschutzerklärung</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-8 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Verantwortlicher</h2>
            <p>
              <strong>Vianova eG</strong><br />
              Anni-Eisler-Lehmann-Str. 3, 55122 Mainz<br />
              E-Mail: <a href="mailto:datenschutz@vianova.coop" className="text-indigo-600 hover:underline">datenschutz@vianova.coop</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Über diesen Dienst</h2>
            <p>
              MoPilot ist ein KI-gestützter Demo-Prototyp (v0.1) für rollenbasiertes E-Carsharing-Management.
              Die Plattform ist passwortgeschützt und ausschließlich für autorisierte Testzwecke zugänglich.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Datenerhebung beim Besuch</h2>
            <p>Beim Aufruf dieser Website werden durch den Webserver automatisch folgende Daten erfasst:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>IP-Adresse des anfragenden Rechners</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Name und URL der abgerufenen Datei</li>
              <li>Übertragene Datenmenge</li>
              <li>Verwendeter Browser und Betriebssystem</li>
            </ul>
            <p className="mt-3">
              Rechtsgrundlage: Art. 6 Abs. 1 S. 1 lit. f DS-GVO. Die Daten werden nach spätestens 14 Tagen gelöscht.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies und Session</h2>
            <p>
              Diese Website verwendet ausschließlich technisch notwendige Cookies für Authentifizierung
              und Sitzungsverwaltung. Es werden keine Tracking- oder Werbe-Cookies eingesetzt.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>demo_auth</strong>: Zugangs-Cookie, Gültigkeit 8 Stunden</li>
            </ul>
            <p className="mt-3">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DS-GVO (berechtigtes Interesse am Schutz der Plattform).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Demo-Accounts und Nutzerdaten</h2>
            <p>
              Für den Betrieb der Demo werden vordefinierte Testaccounts verwendet. Bei der Anmeldung
              werden ein JWT-Token (Gültigkeit 8 Stunden) sowie Sitzungsdaten im Browser gespeichert.
              Es werden keine personenbezogenen Daten der Tester dauerhaft gespeichert.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. KI-Chatfunktion</h2>
            <p>
              Die Chatfunktion nutzt die Claude API von Anthropic, Inc. (USA). Eingaben werden zur
              Verarbeitung an Anthropic-Server übertragen. Bitte geben Sie keine personenbezogenen
              Daten in den Chat ein.
            </p>
            <p className="mt-2">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DS-GVO.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Keine Weitergabe an Dritte</h2>
            <p>
              Eine Weitergabe Ihrer personenbezogenen Daten an Dritte findet nicht statt, sofern wir nicht
              gesetzlich dazu verpflichtet sind.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Ort der Datenverarbeitung</h2>
            <p>
              Die Serverinfrastruktur befindet sich in Deutschland (Hetzner Online GmbH).
              Daten werden grundsätzlich in Deutschland verarbeitet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Ihre Rechte nach DS-GVO</h2>
            <p>Sie haben das Recht auf:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Auskunft (Art. 15 DS-GVO)</li>
              <li>Berichtigung (Art. 16 DS-GVO)</li>
              <li>Löschung (Art. 17 DS-GVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DS-GVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DS-GVO)</li>
              <li>Widerspruch (Art. 21 DS-GVO)</li>
            </ul>
            <p className="mt-3">
              Kontakt:{' '}
              <a href="mailto:datenschutz@vianova.coop" className="text-indigo-600 hover:underline">datenschutz@vianova.coop</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Zuständige Aufsichtsbehörde</h2>
            <p>
              Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz<br />
              Hintere Bleiche 34, 55116 Mainz<br />
              Telefon: +49 (0) 6131 208-2449<br />
              <a href="https://www.datenschutz.rlp.de" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.datenschutz.rlp.de</a>
            </p>
          </section>

          <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">Stand: März 2026</p>
        </div>

        <div className="mt-6 text-center">
          <a href="/impressum" className="text-indigo-600 hover:underline text-sm">→ Zum Impressum</a>
        </div>
      </main>
    </div>
  )
}
