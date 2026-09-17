import React from 'react';

interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  maxScore = 10,
  size = 'md',
  showLabel = false,
}) => {
  const isHigh = score >= 8.0;
  const isMid = score >= 6.0 && score < 8.0;

  const colorClasses = isHigh
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : isMid
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  const dotClasses = isHigh
    ? 'bg-emerald-400'
    : isMid
    ? 'bg-amber-400'
    : 'bg-rose-400';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-mono border ${colorClasses} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClasses} animate-pulse`} />
      <span>{score.toFixed(1)}</span>
      <span className="opacity-50 text-[0.85em]">/{maxScore}</span>
      {showLabel && (
        <span className="ml-1 text-[0.75em] uppercase tracking-wider font-sans font-medium opacity-80">
          {isHigh ? 'Strong' : isMid ? 'Average' : 'Needs Work'}
        </span>
      )}
    </span>
  );
};
