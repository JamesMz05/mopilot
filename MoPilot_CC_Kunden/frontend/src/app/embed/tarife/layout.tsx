import type { Metadata } from 'next'
import '../../globals.css'

export const metadata: Metadata = {
  title: 'CC Tarife – Embed',
  robots: 'noindex, nofollow',
}

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-transparent">
        {children}
      </body>
    </html>
  )
}
