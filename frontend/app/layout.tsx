import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MoPilot – KI-Assistent für nachhaltiges Carsharing',
  description: 'Intelligenter Mobilitätsassistent für E-Carsharing im ländlichen Raum. Rollenbasierter KI-Chat für alle Stakeholder.',
  metadataBase: new URL('https://mopilot.website'),
  keywords: 'MoPilot, KI-Assistent, E-Carsharing, Mobilität, ländlicher Raum, Carsharing',
  openGraph: {
    title: 'MoPilot – KI-Assistent für nachhaltiges Carsharing',
    description: 'Intelligenter Mobilitätsassistent für E-Carsharing im ländlichen Raum',
    locale: 'de_DE',
    type: 'website',
    siteName: 'MoPilot',
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
