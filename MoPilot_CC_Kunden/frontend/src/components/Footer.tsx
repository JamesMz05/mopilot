import { Zap, Phone, Mail, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-cc-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-cc-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">CC Kundenassistent</span>
            </div>
            <p className="text-cc-300 text-sm leading-relaxed">
              KI-gestützter Prototyp im Rahmen des MoPilot-Projekts.
              Alle Inhalte basieren auf Daten von carsharing2go.net und sharing-community.de.
            </p>
            <p className="text-cc-400 text-xs mt-3">
              powered by <a href="https://mopilot.website" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">MoPilot</a>
            </p>
          </div>

          {/* CC Links */}
          <div>
            <h3 className="font-semibold text-cc-200 mb-3 text-sm uppercase tracking-wider">CC CarSharing</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'CC CarSharing Portal', href: 'https://carsharing2go.net' },
                { label: 'Genossenschaft', href: 'https://sharing-community.de' },
                { label: 'Jetzt registrieren', href: 'https://cc.evemo.app/admin/signup' },
                { label: 'Standortpate werden', href: 'https://sharing-community.de/standortpate' },
                { label: 'RideSharing (goFlux)', href: 'https://www.goflux.de' },
              ].map(l => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cc-300 hover:text-white transition-colors flex items-center gap-1"
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
            <h3 className="font-semibold text-cc-200 mb-3 text-sm uppercase tracking-wider">Kontakt & Support</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-cc-300">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:cc-flottenmanagement@vianova.coop" className="hover:text-white transition-colors">
                  cc-flottenmanagement@vianova.coop
                </a>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-cc-800 rounded-lg">
              <p className="text-xs text-cc-300">
                Buchung und Fahrzeugöffnung über <strong className="text-white">evemo.app</strong> – einfach und bequem.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-cc-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-cc-500">
          <p>Ein MoPilot-Prototyp | Keine Gewähr auf Aktualität der Daten | Aktuelle Preise auf <a href="https://carsharing2go.net" className="underline hover:text-cc-300" target="_blank" rel="noopener noreferrer">carsharing2go.net</a></p>
          <p>© Car&RideSharing Community eG, 2026</p>
        </div>
      </div>
    </footer>
  )
}
