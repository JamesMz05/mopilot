import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZEO Kundenassistent – powered by MoPilot',
  description: 'KI-gestützter Kundenassistent für ZEO E-Carsharing in der Region Bruchsal. Tarife, Fahrzeuge, Stationen und mehr.',
  keywords: 'ZEO, Carsharing, E-Carsharing, Bruchsal, Elektroauto, Mobilität',
  openGraph: {
    title: 'ZEO Kundenassistent',
    description: 'Ihr persönlicher KI-Assistent für ZEO E-Carsharing',
    locale: 'de_DE',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
