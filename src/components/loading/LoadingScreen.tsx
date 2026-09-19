import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Search, 
  Shield, 
  Sparkles, 
  Terminal, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  Flame,
  Code2,
  Cpu
} from 'lucide-react';
import { LOADING_STAGES } from '../../data/mockData';

interface LoadingScreenProps {
  url: string;
  error?: string | null;
  onRetry?: () => void;
  onCancel: () => void;
  onSelectSample?: (url: string) => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  url,
  error = null,
  onRetry,
  onCancel,
  onSelectSample,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Clean domain display
  const domainDisplay = url.replace(/^https?:\/\//i, '').replace(/\/$/, '');

  // Progressively advance stages while in-flight
  useEffect(() => {
    if (error) return;

    setCurrentStageIndex(0);
    setLogs([
      `[0.00s] Initializing portfolio audit pipeline for https://${domainDisplay}...`,
      `[0.25s] Validating target domain syntax and DNS resolution...`,
    ]);

    const stageTimers: NodeJS.Timeout[] = [];

    // Stage 1: Inspecting DOM
    stageTimers.push(
      setTimeout(() => {
        setCurrentStageIndex(1);
        setLogs((prev) => [
          ...prev,
          `[0.65s] Fetching public HTML payload... (HTTP 200 OK)`,
          `[0.85s] Parsing DOM document tree and landmark elements...`,
        ]);
      }, 700)
    );

    // Stage 2: Analyzing Structure & Accessibility
    stageTimers.push(
      setTimeout(() => {
        setCurrentStageIndex(2);
        setLogs((prev) => [
          ...prev,
          `[1.30s] Scanning heading hierarchy (H1-H6) and image alt tags...`,
          `[1.55s] Checking mobile viewport meta and responsive CSS rules...`,
        ]);
      }, 1400)
    );

    // Stage 3: Consulting Gemini AI
    stageTimers.push(
      setTimeout(() => {
        setCurrentStageIndex(3);
        setLogs((prev) => [
          ...prev,
          `[2.05s] Synthesizing observable DOM signals into structured prompt...`,
          `[2.25s] Querying Gemini AI audit engine for constructive critique...`,
        ]);
      }, 2100)
    );

    // Stage 4: Finalizing Weighted Scores
    stageTimers.push(
      setTimeout(() => {
        setCurrentStageIndex(4);
        setLogs((prev) => [
          ...prev,
          `[2.80s] Calculating UI/UX, Performance, Accessibility & Content scores...`,
          `[3.00s] Prioritizing high-impact suggestions and assembling report...`,
        ]);
      }, 2800)
    );

    return () => {
      stageTimers.forEach(clearTimeout);
    };
  }, [domainDisplay, error]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Calculate percentage
  const progressPercent = error
    ? 0
    : Math.min(95, Math.round(((currentStageIndex + 1) / LOADING_STAGES.length) * 100));

  const getStageIcon = (idx: number, isDone: boolean, isCurrent: boolean) => {
    if (isDone) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    if (isCurrent) {
      return <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />;
    }
    switch (idx) {
      case 0:
        return <Globe className="w-4 h-4 text-neutral-500" />;
      case 1:
        return <Search className="w-4 h-4 text-neutral-500" />;
      case 2:
        return <Shield className="w-4 h-4 text-neutral-500" />;
      case 3:
        return <Sparkles className="w-4 h-4 text-neutral-500" />;
      case 4:
        return <Terminal className="w-4 h-4 text-neutral-500" />;
      default:
        return <Terminal className="w-4 h-4 text-neutral-500" />;
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative z-10">
      <div className="w-full max-w-3xl mx-auto">
        {/* Top return action & context */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors p-1 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Return to Home</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="truncate max-w-[200px] sm:max-w-xs">{domainDisplay}</span>
          </div>
        </div>

        {/* Error Card View */}
        {error ? (
          <div className="rounded-2xl border border-rose-500/40 bg-neutral-900/95 shadow-2xl p-6 sm:p-8 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400">
                    Audit Unsuccessful
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-sans text-neutral-100 mt-1">
                  Could not complete portfolio audit
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 font-mono mt-1 break-all">
                  Target: {url}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/80 border border-rose-950/80 mb-6">
              <p className="text-sm text-neutral-200 font-sans leading-relaxed">
                {error}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 mb-6">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold text-xs font-mono transition-colors shadow-lg shadow-orange-500/20 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Audit</span>
                </button>
              )}
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors cursor-pointer"
              >
                <span>Edit URL or Try Another</span>
              </button>
            </div>

            {/* Quick Test Alternatives */}
            {onSelectSample && (
              <div className="pt-4 border-t border-neutral-800/80">
                <p className="text-xs font-mono text-neutral-400 mb-2.5">
                  Or test the live roast pipeline with one of these verified portfolios:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectSample('https://leerob.io')}
                    className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-orange-500/50 text-neutral-300 hover:text-orange-400 text-xs font-mono transition-colors cursor-pointer"
                  >
                    leerob.io (Senior)
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectSample('https://paco.me')}
                    className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-orange-500/50 text-neutral-300 hover:text-orange-400 text-xs font-mono transition-colors cursor-pointer"
                  >
                    paco.me (Design Eng)
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectSample('https://johndoe-portfolio.vercel.app')}
                    className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-orange-500/50 text-neutral-300 hover:text-orange-400 text-xs font-mono transition-colors cursor-pointer"
                  >
                    johndoe.vercel.app (Junior)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active Loading Terminal View */
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800/80 bg-neutral-950/60">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-sm" />
                <div className="ml-3 hidden sm:flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>roast-engine://audit-pipeline</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-orange-400 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="font-bold">{progressPercent}%</span>
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-8 space-y-6">
              {/* Target Banner & Title */}
              <div className="text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-800/80">
                <div>
                  <span className="text-[11px] font-mono text-orange-400 uppercase tracking-wider font-semibold">
                    Live Analysis In Progress
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold font-sans text-neutral-100 mt-0.5 tracking-tight">
                    Roasting Your Portfolio
                  </h1>
                </div>

                <div className="mt-3 sm:mt-0 flex items-center justify-center sm:justify-end gap-2 text-xs font-mono text-neutral-400">
                  <Cpu className="w-4 h-4 text-orange-400" />
                  <span>Gemini 2.5 Flash + DOM Parser</span>
                </div>
              </div>

              {/* Glowing Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 mb-2">
                  <span>Pipeline Progress</span>
                  <span className="text-neutral-200 font-semibold">
                    Stage {currentStageIndex + 1} of {LOADING_STAGES.length}
                  </span>
                </div>
                <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 h-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(249,115,22,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Stage Progression Cards */}
              <div className="grid grid-cols-1 gap-2.5">
                {LOADING_STAGES.map((stage, idx) => {
                  const isDone = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div
                      key={stage.key}
                      className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-300 font-mono text-xs ${
                        isCurrent
                          ? 'bg-neutral-850/90 border-orange-500/50 text-neutral-100 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                          : isDone
                          ? 'bg-neutral-950/40 border-neutral-800/50 text-neutral-400'
                          : 'bg-transparent border-transparent text-neutral-600'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {getStageIcon(idx, isDone, isCurrent)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold ${
                              isCurrent ? 'text-orange-300' : isDone ? 'text-neutral-200' : 'text-neutral-500'
                            }`}
                          >
                            {stage.label}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-mono">
                            {isDone ? (
                              <span className="text-emerald-400 font-bold">DONE</span>
                            ) : isCurrent ? (
                              <span className="text-orange-400 font-bold animate-pulse">ANALYZING</span>
                            ) : (
                              <span className="text-neutral-600">PENDING</span>
                            )}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] font-sans mt-0.5 leading-normal ${
                            isCurrent ? 'text-neutral-300' : 'text-neutral-500'
                          }`}
                        >
                          {stage.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Diagnostic Console Feed */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Live Audit Telemetry</span>
                  </span>
                  <span className="text-[10px] text-neutral-500">Auto-scrolling</span>
                </div>
                <div className="rounded-xl bg-black/80 border border-neutral-800/90 p-3.5 font-mono text-[11px] text-neutral-300 h-28 overflow-y-auto space-y-1.5 shadow-inner">
                  {logs.map((log, i) => (
                    <div key={i} className="leading-relaxed flex items-start gap-2">
                      <span className="text-orange-400 shrink-0">&gt;</span>
                      <span className={i === logs.length - 1 ? 'text-emerald-300 font-semibold' : 'text-neutral-300'}>
                        {log}
                      </span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>

              {/* Footer Notice */}
              <div className="pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Inspecting live observable signals
                </span>
                <span>You will be redirected once analysis is ready</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
