import React from 'react';
import { Flame, ShieldCheck, Database, Cpu, Terminal, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 text-neutral-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-neutral-100 font-bold text-base">
              <div className="w-7 h-7 rounded bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                <Flame className="w-4 h-4" />
              </div>
              <span>Roast My Portfolio</span>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-md leading-relaxed">
              An AI-powered portfolio auditing system that inspects observable DOM structure, semantic HTML, and accessibility markers, delivering constructive developer roasts and actionable engineering suggestions.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-neutral-400">
              <span className="inline-flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                SSRF Protected
              </span>
              <span className="inline-flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                <Cpu className="w-3 h-3 text-amber-400" />
                Gemini AI Backed
              </span>
              <span className="inline-flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                <Database className="w-3 h-3 text-cyan-400" />
                PostgreSQL Architecture
              </span>
            </div>
          </div>

          {/* Col 2: Evaluation & Scoring Formula */}
          <div className="space-y-3">
            <h4 className="text-neutral-200 font-semibold text-xs tracking-wider uppercase font-mono">
              Scoring Weights
            </h4>
            <ul className="space-y-1.5 text-xs text-neutral-400 font-mono">
              <li className="flex justify-between border-b border-neutral-900 pb-1">
                <span>UI / UX Polish</span>
                <span className="text-neutral-200">30%</span>
              </li>
              <li className="flex justify-between border-b border-neutral-900 pb-1">
                <span>Performance Signals</span>
                <span className="text-neutral-200">25%</span>
              </li>
              <li className="flex justify-between border-b border-neutral-900 pb-1">
                <span>Accessibility & Semantics</span>
                <span className="text-neutral-200">25%</span>
              </li>
              <li className="flex justify-between pb-1">
                <span>Content & Project Depth</span>
                <span className="text-neutral-200">20%</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Context */}
          <div className="space-y-3">
            <h4 className="text-neutral-200 font-semibold text-xs tracking-wider uppercase font-mono">
              Architecture
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Designed with a clear separation of concerns, secure server-side AI execution, observable DOM analysis, and transparent category scoring.
            </p>
            <div className="pt-1">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-mono transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Back to Top</span>
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p className="text-center sm:text-left">
            Notice: Initial performance indicators represent observable DOM characteristics (asset sizes, viewport tags, script weights), not synthetic Lighthouse lab runs.
          </p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>&copy; {new Date().getFullYear()} Roast My Portfolio</span>
            <span className="text-neutral-800">•</span>
            <span className="text-neutral-400">MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
