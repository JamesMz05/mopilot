'use client';

interface MotivationButtonProps {
  current: number;
  total: number;
  wasCorrect: boolean;
  onClick: () => void;
}

const CORRECT_TEXTS = [
  'Weiter so!',
  'Stark, nächste Frage!',
  'Richtig! Weiter geht\'s',
  'Super, du kennst dich aus!',
  'Perfekt! Nächste Frage',
  'Klasse! Weiter',
];

const WRONG_TEXTS = [
  'Nicht schlimm, weiter!',
  'Nächster Versuch zählt!',
  'Weiter geht\'s!',
  'Kopf hoch, nächste Frage!',
];

const FINAL_TEXT = 'Ergebnis anzeigen';

export default function MotivationButton({ current, total, wasCorrect, onClick }: MotivationButtonProps) {
  const isLast = current >= total;

  let text: string;
  if (isLast) {
    text = FINAL_TEXT;
  } else if (wasCorrect) {
    text = CORRECT_TEXTS[current % CORRECT_TEXTS.length];
  } else {
    text = WRONG_TEXTS[current % WRONG_TEXTS.length];
  }

  return (
    <button
      onClick={onClick}
      className="mt-4 w-full sm:w-auto px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-display font-semibold rounded-2xl transition-all duration-200 shadow-warm-md hover:shadow-warm-lg active:scale-[0.98] sm:sticky sm:bottom-0 md:static"
    >
      {text} →
    </button>
  );
}
