import './globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MoPilot – KI-Assistent für nachhaltiges Carsharing',
  description: 'Intelligenter Mobilitätsassistent für E-Carsharing im ländlichen Raum',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
