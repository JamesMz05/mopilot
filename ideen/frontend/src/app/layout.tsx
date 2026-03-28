import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "MoPilot Ideenplattform",
  description: "Ideen-Sammelplattform für das Projekt MoPilot – Gemeinsam bessere Mobilität gestalten",
  metadataBase: new URL("https://ideen.mopilot.website"),
  keywords: "MoPilot, Ideenplattform, Mobilität, Carsharing, Innovation, Beteiligung",
  openGraph: {
    title: "MoPilot Ideenplattform",
    description: "Sammeln, bewerten und diskutieren Sie Ideen für den KI-gestützten Mobilitätsassistenten",
    locale: "de_DE",
    type: "website",
    siteName: "MoPilot Ideenplattform",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="bg-surface-50 min-h-screen">
        <a href="#main-content" className="skip-nav">Zum Inhalt springen</a>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
