'use client'

import MoPilotLogo from './MoPilotLogo'

interface FooterProps {
  platformName?: string
  showFoerderer?: boolean
  className?: string
}

export default function Footer({
  platformName = 'MoPilot',
  showFoerderer = true,
  className = '',
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`bg-surface-900 text-surface-300 ${className}`}>
      {/* Foerderer section */}
      {showFoerderer && (
        <div className="border-b border-surface-700/50">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <p className="text-xs text-surface-500 text-center mb-4 font-body">
              Gefördert durch
            </p>
            <div className="flex items-center justify-center gap-8 opacity-50">
              <span className="text-sm font-body text-surface-400">BMDV</span>
              <span className="text-surface-600">|</span>
              <span className="text-sm font-body text-surface-400">NOW GmbH</span>
              <span className="text-surface-600">|</span>
              <span className="text-sm font-body text-surface-400">Vianova eG</span>
            </div>
          </div>
        </div>
      )}

      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <MoPilotLogo variant="white" size="sm" />
            <p className="mt-3 text-sm text-surface-400 font-body leading-relaxed">
              KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum.
              Ein Projekt der Vianova eG.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-surface-200 mb-3 font-display">
              Rechtliches
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/impressum"
                  className="text-sm text-surface-400 hover:text-white transition-colors font-body"
                >
                  Impressum
                </a>
              </li>
              <li>
                <a
                  href="/datenschutz"
                  className="text-sm text-surface-400 hover:text-white transition-colors font-body"
                >
                  Datenschutz
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-surface-200 mb-3 font-display">
              Kontakt
            </h4>
            <p className="text-sm text-surface-400 font-body">
              Vianova Genossenschaft eG
            </p>
            <p className="text-sm text-surface-400 font-body mt-1">
              info@vianova.coop
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-surface-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-surface-500 font-body">
            &copy; {currentYear} {platformName} – Ein Projekt der Vianova eG
          </p>
          <p className="text-xs text-surface-500 font-body">
            Powered by KI &middot; Made in Germany
          </p>
        </div>
      </div>
    </footer>
  )
}
