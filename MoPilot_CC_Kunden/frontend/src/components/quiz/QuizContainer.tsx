'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchQuiz,
  startSession,
  submitAnswer,
  completeQuiz,
  abandonQuiz,
  getSessionState,
  getDeviceClass,
  getQuizSessionCookie,
  type QuizDefinitionPublic,
  type QuizCompleteResponse,
  type QuizSessionState,
} from '@/lib/quiz-api';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';
import ResultScreen from './ResultScreen';
import CookieConsentBanner from './CookieConsentBanner';

const QUIZ_SLUG = 'cc-mobilitaets-check';

type Phase = 'loading' | 'start' | 'playing' | 'result';

export default function QuizContainer() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [quiz, setQuiz] = useState<QuizDefinitionPublic | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<QuizCompleteResponse | null>(null);
  const [existingState, setExistingState] = useState<QuizSessionState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const init = async () => {
      try {
        const cookieSession = getQuizSessionCookie();
        if (cookieSession) {
          const state = await getSessionState(cookieSession);
          if (state.status === 'completed') {
            setExistingState(state);
            setResult({
              score: state.score || 0,
              total: state.total || 14,
              voucher_code: state.voucher_code || '',
              voucher_label: state.voucher_label || '',
              registration_url: state.registration_url || '',
            });
            setPhase('result');
            return;
          }
          if (state.status === 'running') {
            setSessionId(cookieSession);
          }
        }

        const quizData = await fetchQuiz(QUIZ_SLUG);
        setQuiz(quizData);
        setPhase('start');
      } catch {
        setError('Quiz konnte nicht geladen werden.');
      }
    };
    init();
  }, []);

  const handleStart = useCallback(async () => {
    try {
      const referrer = document.referrer || 'direct';
      const device = getDeviceClass();
      const res = await startSession(QUIZ_SLUG, referrer, device);
      setSessionId(res.session_id);
      setQuiz(res.quiz);
      setCurrentIndex(0);
      setPhase('playing');
    } catch {
      setError('Quiz konnte nicht gestartet werden.');
    }
  }, []);

  const handleAnswer = useCallback(async (selectedIndex: number) => {
    if (!sessionId) throw new Error('Keine Session');
    return submitAnswer(sessionId, currentIndex, selectedIndex);
  }, [sessionId, currentIndex]);

  const handleNext = useCallback(async () => {
    if (!quiz) return;
    const next = currentIndex + 1;
    if (next >= quiz.questions.length) {
      // Complete
      try {
        const res = await completeQuiz(sessionId!);
        setResult(res);
        setPhase('result');
      } catch {
        setError('Quiz konnte nicht abgeschlossen werden.');
      }
    } else {
      setCurrentIndex(next);
    }
  }, [currentIndex, quiz, sessionId]);

  // Abandon on page leave
  useEffect(() => {
    if (!sessionId || phase !== 'playing') return;
    const handleUnload = () => abandonQuiz(sessionId);
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [sessionId, phase]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-700 font-body">{error}</p>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-surface-500 font-body">Quiz wird geladen...</p>
      </div>
    );
  }

  if (phase === 'result' && result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ResultScreen result={result} />
      </div>
    );
  }

  if (phase === 'start' && quiz) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-surface-800 mb-4">
            {quiz.title}
          </h1>
          <p className="text-lg text-surface-600 font-body mb-2">
            Teste dein Wissen rund um CC-Carsharing!
          </p>
          <p className="text-surface-500 font-body mb-8">
            {quiz.questions.length} Fragen · ca. 5 Minuten · Gutscheincode als Belohnung
          </p>
          <button
            onClick={handleStart}
            className="px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white font-display font-bold text-lg rounded-2xl transition-all duration-200 shadow-warm-lg hover:shadow-warm-xl active:scale-[0.98]"
          >
            Quiz starten
          </button>
        </div>
        <CookieConsentBanner />
      </div>
    );
  }

  if (phase === 'playing' && quiz) {
    const question = quiz.questions[currentIndex];
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProgressBar
          current={currentIndex + 1}
          total={quiz.questions.length}
          category={question.category}
        />
        <QuestionCard
          key={currentIndex}
          question={question}
          questionIndex={currentIndex}
          current={currentIndex + 1}
          total={quiz.questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    );
  }

  return null;
}
