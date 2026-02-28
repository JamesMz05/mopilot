import { Zap, Phone, Mail, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-zeo-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-zeo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">ZEO Kundenassistent</span>
            </div>
            <p className="text-zeo-300 text-sm leading-relaxed">
              KI-gestützter Prototyp im Rahmen des MoPilot-Projekts.
              Alle Inhalte basieren auf Daten von zeo-carsharing.de.
            </p>
            <p className="text-zeo-400 text-xs mt-3">
              powered by <a href="https://mopilot.website" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">MoPilot</a>
            </p>
          </div>

          {/* ZEO Links */}
          <div>
            <h3 className="font-semibold text-zeo-200 mb-3 text-sm uppercase tracking-wider">ZEO Carsharing</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Zur ZEO Website', href: 'https://www.zeo-carsharing.de' },
                { label: 'Jetzt registrieren', href: 'https://www.zeo-carsharing.de/registrierung' },
                { label: 'Tarife', href: 'https://www.zeo-carsharing.de/kosten' },
                { label: 'Fahrzeuge', href: 'https://www.zeo-carsharing.de/unsere-modelle' },
                { label: 'FAQ', href: 'https://www.zeo-carsharing.de/faqs' },
              ].map(l => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zeo-300 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {l.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-zeo-200 mb-3 text-sm uppercase tracking-wider">Kontakt & Support</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-zeo-300">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+4961318383233" className="hover:text-white transition-colors">
                  0 61 31 83 832 333
                </a>
              </li>
              <li className="flex items-center gap-2 text-zeo-300">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:service@zeo-carsharing.de" className="hover:text-white transition-colors">
                  service@zeo-carsharing.de
                </a>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-zeo-800 rounded-lg">
              <p className="text-xs text-zeo-300">
                App <strong className="text-white">"mein zeo"</strong> für iOS und Android – kostenlos verfügbar.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-zeo-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-zeo-500">
          <p>Ein MoPilot-Prototyp | Keine Gewähr auf Aktualität der Daten | Aktuelle Preise auf <a href="https://www.zeo-carsharing.de" className="underline hover:text-zeo-300" target="_blank" rel="noopener noreferrer">zeo-carsharing.de</a></p>
          <p>© ZEO Carsharing, 2026</p>
        </div>
      </div>
    </footer>
  )
}
