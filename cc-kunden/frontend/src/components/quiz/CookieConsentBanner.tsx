'use client';

import { useState } from 'react';

export default function CookieConsentBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-surface-800 text-white px-4 py-3 flex items-center justify-between gap-4 text-sm font-body">
      <p className="flex-1">
        Wir speichern deinen Quiz-Fortschritt anonym in einem Cookie (30 Tage).
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold whitespace-nowrap transition-colors"
      >
        OK
      </button>
    </div>
  );
}
