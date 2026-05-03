'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  category: string;
}

export default function ProgressBar({ current, total, category }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="inline-block bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          {category}
        </span>
        <span className="text-sm text-surface-500 font-body">
          Frage {current} von {total}
        </span>
      </div>
      <div className="w-full h-2 bg-surface-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
