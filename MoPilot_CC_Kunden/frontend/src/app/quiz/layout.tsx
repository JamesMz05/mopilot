import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mobilitäts-Check | CC-Carsharing',
  description: 'Teste dein Wissen rund um CC-Carsharing und sichere dir 20 Stunden Startguthaben!',
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-50 to-white">
      {children}
    </div>
  );
}
