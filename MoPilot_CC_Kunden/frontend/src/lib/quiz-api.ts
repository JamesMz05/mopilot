const API_BASE = process.env.NEXT_PUBLIC_QUIZ_API_BASE || 'https://api.mopilot.website';

export interface QuestionPublic {
  category: string;
  question: string;
  answers: string[];
  explanation: string;
}

export interface QuizDefinitionPublic {
  slug: string;
  title: string;
  operator: string;
  questions: QuestionPublic[];
}

export interface QuizStartResponse {
  session_id: string;
  quiz: QuizDefinitionPublic;
}

export interface QuizAnswerResponse {
  is_correct: boolean;
  correct_index: number;
  explanation: string;
  progress: string;
}

export interface QuizCompleteResponse {
  score: number;
  total: number;
  voucher_code: string;
  voucher_label: string;
  registration_url: string;
}

export interface QuizSessionState {
  status: 'running' | 'completed' | 'expired';
  voucher_code?: string;
  voucher_label?: string;
  registration_url?: string;
  score?: number;
  total?: number;
}

export async function fetchQuiz(slug: string): Promise<QuizDefinitionPublic> {
  const res = await fetch(`${API_BASE}/api/quiz/${slug}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Quiz nicht gefunden');
  return res.json();
}

export async function startSession(slug: string, referrer: string, userAgentClass: string): Promise<QuizStartResponse> {
  const res = await fetch(`${API_BASE}/api/quiz/${slug}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ referrer, user_agent_class: userAgentClass }),
  });
  if (!res.ok) throw new Error('Session konnte nicht gestartet werden');
  return res.json();
}

export async function submitAnswer(sessionId: string, questionIndex: number, selectedIndex: number): Promise<QuizAnswerResponse> {
  const res = await fetch(`${API_BASE}/api/quiz/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ question_index: questionIndex, selected_index: selectedIndex }),
  });
  if (!res.ok) throw new Error('Antwort konnte nicht gesendet werden');
  return res.json();
}

export async function completeQuiz(sessionId: string): Promise<QuizCompleteResponse> {
  const res = await fetch(`${API_BASE}/api/quiz/sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Quiz konnte nicht abgeschlossen werden');
  return res.json();
}

export async function abandonQuiz(sessionId: string): Promise<void> {
  navigator.sendBeacon(
    `${API_BASE}/api/quiz/sessions/${sessionId}/abandon`,
    new Blob([JSON.stringify({})], { type: 'application/json' })
  );
}

export async function getSessionState(sessionId: string): Promise<QuizSessionState> {
  const res = await fetch(`${API_BASE}/api/quiz/sessions/${sessionId}/state`, { credentials: 'include' });
  if (!res.ok) return { status: 'expired' };
  return res.json();
}

export function getDeviceClass(): string {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export function getQuizSessionCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/mopilot_quiz_session=([^;]+)/);
  return match ? match[1] : null;
}
