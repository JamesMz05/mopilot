'use client';

import { useState } from 'react';
import type { QuestionPublic, QuizAnswerResponse } from '@/lib/quiz-api';
import MotivationButton from './MotivationButton';

interface QuestionCardProps {
  question: QuestionPublic;
  questionIndex: number;
  current: number;
  total: number;
  onAnswer: (selectedIndex: number) => Promise<QuizAnswerResponse>;
  onNext: () => void;
}

export default function QuestionCard({
  question,
  questionIndex,
  current,
  total,
  onAnswer,
  onNext,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<QuizAnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (idx: number) => {
    if (result || loading) return;
    setLoading(true);
    setSelected(idx);
    try {
      const res = await onAnswer(idx);
      setResult(res);
    } catch {
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyle = (idx: number) => {
    const base = 'w-full text-left px-5 py-4 rounded-2xl border-2 font-body text-base transition-all duration-300 min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2';

    if (!result) {
      if (selected === idx && loading) {
        return `${base} border-primary-300 bg-primary-50 text-primary-700 animate-pulse`;
      }
      return `${base} border-surface-200 bg-white hover:border-primary-400 hover:bg-primary-50 cursor-pointer active:scale-[0.98]`;
    }

    // After answer
    if (idx === result.correct_index) {
      return `${base} border-green-500 bg-green-50 text-green-800 font-semibold`;
    }
    if (idx === selected && !result.is_correct) {
      return `${base} border-red-400 bg-red-50 text-red-700`;
    }
    return `${base} border-surface-200 bg-surface-50 text-surface-400`;
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl md:text-2xl font-display font-bold text-surface-800 mb-6 leading-tight">
        {question.question}
      </h2>

      <div className="space-y-3 mb-4">
        {question.answers.map((answer, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={!!result}
            tabIndex={0}
            className={getButtonStyle(idx)}
          >
            {answer}
          </button>
        ))}
      </div>

      {result && (
        <div className="animate-fade-in mt-4">
          <div className={`rounded-xl p-4 text-sm font-body leading-relaxed border-l-4 ${
            result.is_correct
              ? 'bg-green-50 border-green-400 text-green-800'
              : 'bg-amber-50 border-amber-400 text-amber-800'
          }`}>
            {result.explanation}
          </div>

          <div className="flex justify-end mt-4">
            <MotivationButton
              current={current}
              total={total}
              wasCorrect={result.is_correct}
              onClick={onNext}
            />
          </div>
        </div>
      )}
    </div>
  );
}
