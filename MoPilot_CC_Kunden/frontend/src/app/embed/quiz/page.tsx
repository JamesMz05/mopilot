'use client';

import { useEffect, useRef } from 'react';
import QuizContainer from '@/components/quiz/QuizContainer';

function AutoResize() {
  const sentHeight = useRef(0);

  useEffect(() => {
    const send = () => {
      const h = document.documentElement.scrollHeight;
      if (h !== sentHeight.current) {
        sentHeight.current = h;
        window.parent.postMessage({ type: 'cc-quiz-resize', height: h }, '*');
      }
    };

    send();
    const observer = new MutationObserver(send);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener('resize', send);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', send);
    };
  }, []);

  return null;
}

export default function EmbedQuizPage() {
  return (
    <>
      <AutoResize />
      <QuizContainer />
    </>
  );
}
