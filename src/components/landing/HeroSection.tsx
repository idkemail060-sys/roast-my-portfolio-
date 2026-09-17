import React from 'react';
import { Flame, Shield, CheckCircle2, Terminal, Code2, Sparkles } from 'lucide-react';
import { UrlSubmissionForm } from './UrlSubmissionForm';
import { Portfolio3DCard } from './Portfolio3DCard';

interface HeroSectionProps {
  onSubmitUrl: (url: string) => void;
  isLoading: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSubmitUrl,
  isLoading,
}) => {
  return (
    <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
      {/* Background subtle radial gradient & grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-mono text-neutral-300 mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          <span>Real DOM Analysis + Gemini AI Reviewer</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-100 mb-6 font-sans leading-[1.1]">
          Think your portfolio is good? <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
            Let's find out.
          </span>
        </h1>

        {/* Product Description */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-400 mb-8 sm:mb-10 leading-relaxed">
          Submit any public portfolio URL. Our engine inspects observable DOM structure, evaluates accessibility and content signals, and delivers a constructive developer roast with actionable improvement suggestions.
        </p>

        {/* Submission Form */}
        <UrlSubmissionForm onSubmit={onSubmitUrl} isLoading={isLoading} />

        {/* 3D Interactive Portfolio Analysis Mockup */}
        <div className="mt-8 sm:mt-12">
          <Portfolio3DCard />
        </div>

        {/* Value Props Strip */}
        <div className="mt-10 sm:mt-14 pt-8 border-t border-neutral-900/80 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-neutral-200">Public HTML Parsing</p>
              <p className="text-[11px] text-neutral-400">No mock stubs or fakes</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-neutral-200">Weighted Scoring</p>
              <p className="text-[11px] text-neutral-400">Deterministic 30/25/25/20</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-neutral-200">Constructive Roast</p>
              <p className="text-[11px] text-neutral-400">Sharp, witty, professional</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-neutral-200">Actionable Prioritization</p>
              <p className="text-[11px] text-neutral-400">Ranked by severity</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
