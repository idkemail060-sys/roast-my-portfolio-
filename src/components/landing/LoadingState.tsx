import React, { useEffect, useState } from 'react';
import { Terminal, CheckCircle2, Loader2, Sparkles, Shield, Globe, Search, AlertCircle, RefreshCw, X } from 'lucide-react';
import { LOADING_STAGES } from '../../data/mockData';

interface LoadingStateProps {
  url: string;
  onComplete?: () => void;
  activeStageIndex?: number;
  error?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  url,
  onComplete,
  activeStageIndex: externalStageIndex,
  error = null,
  onRetry,
  onCancel,
}) => {
  const [internalStage, setInternalStage] = useState(0);

  // If no external control is passed and not in error, advance stages with natural progression
  useEffect(() => {
    if (externalStageIndex !== undefined || error) return;

    const intervals = [1200, 1500, 1500, 2000, 1200];
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      if (current < LOADING_STAGES.length) {
        setInternalStage(current);
      } else {
        clearInterval(timer);
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      }
    }, intervals[current] || 1500);

    return () => clearInterval(timer);
  }, [externalStageIndex, error, onComplete]);

  const currentStage = externalStageIndex !== undefined ? externalStageIndex : internalStage;
  const progressPercent = error
    ? 0
    : Math.min(100, Math.round(((currentStage + 1) / LOADING_STAGES.length) * 100));

  const getStageIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Globe className="w-4 h-4" />;
      case 1:
        return <Search className="w-4 h-4" />;
      case 2:
        return <Shield className="w-4 h-4" />;
      case 3:
        return <Sparkles className="w-4 h-4" />;
      case 4:
        return <Terminal className="w-4 h-4" />;
      default:
        return <Terminal className="w-4 h-4" />;
    }
  };

  // If there's an active error during loading/audit
  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-xl border border-rose-500/40 bg-neutral-900/95 shadow-2xl p-6 sm:p-8 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-rose-950 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block font-bold">
                Audit Failed
              </span>
              <h3 className="text-sm font-bold font-mono text-neutral-100 truncate max-w-sm">
                {url}
              </h3>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-neutral-400 hover:text-neutral-200 p-1 rounded-md hover:bg-neutral-800 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-sm text-neutral-300 mb-6 font-sans leading-relaxed">
          {error}
        </p>

        <div className="flex items-center gap-3 pt-4 border-t border-neutral-800/80">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold text-xs font-mono transition-colors shadow-md shadow-orange-500/10 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Audit</span>
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
            >
              Edit URL / Try Another
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-md">
      {/* Header with simulated terminal dots */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-neutral-400 truncate max-w-[200px] sm:max-w-xs">
            audit://{url.replace(/^https?:\/\//, '')}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-orange-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{progressPercent}% COMPLETE</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-400 h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stage Steps List */}
      <div className="space-y-3.5">
        {LOADING_STAGES.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;

          return (
            <div
              key={stage.key}
              className={`flex items-start gap-3.5 p-3 rounded-lg border transition-all duration-300 font-mono text-xs ${
                isCurrent
                  ? 'bg-neutral-800/80 border-orange-500/40 text-neutral-100 shadow-sm'
                  : isDone
                  ? 'bg-neutral-900/40 border-neutral-800/50 text-neutral-400'
                  : 'bg-transparent border-transparent text-neutral-400 opacity-60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="text-orange-400 animate-spin">
                    <Loader2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="text-neutral-400">{getStageIcon(idx)}</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold ${
                      isCurrent ? 'text-orange-300' : isDone ? 'text-neutral-300' : 'text-neutral-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-mono">
                    {isDone ? (
                      <span className="text-emerald-400">DONE</span>
                    ) : isCurrent ? (
                      <span className="text-orange-400 animate-pulse">RUNNING</span>
                    ) : (
                      <span className="text-neutral-400">QUEUED</span>
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5 leading-normal">
                  {stage.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Real-time server analysis
        </span>
        <span>DOM + Gemini Pipeline</span>
      </div>
    </div>
  );
};
