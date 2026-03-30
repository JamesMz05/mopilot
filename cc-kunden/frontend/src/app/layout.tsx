import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CC Kundenassistent – Car&RideSharing Community',
  description: 'KI-gestützter Kundenassistent der Car&RideSharing Community eG. E-Carsharing im ländlichen Raum – Standorte, Tarife, Fahrzeuge und mehr.',
  metadataBase: new URL('https://cc-kunden.mopilot.website'),
  keywords: 'CC, Car&RideSharing Community, Carsharing, E-Carsharing, Overath, Oberbergischer Kreis, Elektroauto, Genossenschaft',
  openGraph: {
    title: 'CC Kundenassistent – Car&RideSharing Community',
    description: 'Dein KI-Assistent für E-Carsharing der Car&RideSharing Community eG',
    locale: 'de_DE',
    type: 'website',
    siteName: 'CC Kundenassistent',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <a href="#main-content" className="skip-nav">Zum Inhalt springen</a>
        {children}
      </body>
    </html>
  )
}
