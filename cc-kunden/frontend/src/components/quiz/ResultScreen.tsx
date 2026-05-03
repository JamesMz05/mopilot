'use client';

import { useEffect, useState } from 'react';
import type { QuizCompleteResponse } from '@/lib/quiz-api';

interface ResultScreenProps {
  result: QuizCompleteResponse;
}

export default function ResultScreen({ result }: ResultScreenProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const isPerfect = result.score === result.total;

  useEffect(() => {
    if (isPerfect) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isPerfect]);

  const getMessage = () => {
    const ratio = result.score / result.total;
    if (ratio === 1) return 'Hervorragend informiert! Als Belohnung für deinen Wissens-Check erhältst du:';
    if (ratio >= 0.8) return `${result.score} von ${result.total} — solide Basis! Dein Gutscheincode:`;
    if (ratio >= 0.5) return `${result.score} von ${result.total} — guter Start! Hier ist dein Gutscheincode:`;
    return `${result.score} von ${result.total} — schau dir die Infos nochmal an. Trotzdem erhältst du:`;
  };

  return (
    <div className="text-center animate-fade-in-up relative">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="confetti-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: ['#14B8A6', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'][i % 6],
              }}
            />
          ))}
        </div>
      )}

      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-4">
          <span className="text-3xl font-display font-bold text-primary-600">
            {isPerfect ? '🎉' : '✨'}
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-surface-800">
          Ergebnis: {result.score} von {result.total}
        </h2>
      </div>

      <p className="text-lg text-surface-600 font-body mb-8 max-w-md mx-auto">
        {getMessage()}
      </p>

      {/* Voucher card */}
      <div className="inline-block border-2 border-dashed border-amber-400 bg-amber-50 rounded-2xl px-8 py-6 mb-8">
        <p className="text-amber-600 font-display font-bold text-lg uppercase tracking-wider mb-1">
          {result.voucher_label}
        </p>
        <p className="text-surface-500 text-sm mb-2">einmalig für Erstnutzer mit Code:</p>
        <p className="text-3xl md:text-4xl font-display font-black text-surface-800 tracking-wider">
          {result.voucher_code}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-surface-600 font-body">
          Wähle jetzt deinen Tarif und registriere dich direkt bei evemo:
        </p>
        <a
          href={result.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-display font-bold text-lg rounded-2xl transition-all duration-200 shadow-warm-lg hover:shadow-warm-xl active:scale-[0.98]"
        >
          Jetzt registrieren & 20h sichern
        </a>
      </div>
    </div>
  );
}
