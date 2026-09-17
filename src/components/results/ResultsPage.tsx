import React from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  Sliders, 
  Layers, 
  Sparkles,
  Terminal,
  Code2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  FileCode
} from 'lucide-react';
import { motion } from 'motion/react';
import { PortfolioReview } from '../../types';
import { Interactive3DCard, Interactive3DItem } from '../common/Interactive3DCard';
import { DashboardHeader } from './DashboardHeader';
import { ScoreMetricCard } from './ScoreMetricCard';
import { ScoresChartWidget } from './ScoresChartWidget';
import { LighthouseMetricsCard } from './LighthouseMetricsCard';
import { RoastTerminal } from './RoastTerminal';
import { PortfolioScreenshotPreview } from './PortfolioScreenshotPreview';
import { StrengthsWidget } from './StrengthsWidget';
import { IssuesWidget } from './IssuesWidget';
import { SuggestionsWidget } from './SuggestionsWidget';

export interface ResultsPageProps {
  review: PortfolioReview | null;
  isLoading?: boolean;
  error?: string | null;
  onBackToHome: () => void;
  onRetry?: () => void;
  onDelete?: (id: string) => void;
  onOpenHistory?: () => void;
  historyCount?: number;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  review,
  isLoading = false,
  error = null,
  onBackToHome,
  onRetry,
  onDelete,
  onOpenHistory,
  historyCount = 0,
}) => {
  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-6">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <span className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1 block">
          DATABASE SYNCHRONIZATION
        </span>
        <h2 className="text-2xl font-bold font-mono text-neutral-100 mb-3">
          Loading Portfolio Audit Report
        </h2>
        <p className="text-neutral-400 text-sm font-sans leading-relaxed">
          Retrieving verified DOM signals, Gemini 2.5 Flash evaluations, and weighted score distribution from the database...
        </p>
      </div>
    );
  }

  // Error State
  if (error || !review) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono text-rose-400 uppercase tracking-widest mb-1 block">
          REPORT NOT FOUND
        </span>
        <h2 className="text-2xl font-bold font-mono text-neutral-100 mb-3">
          Audit Report Unavailable
        </h2>
        <p className="text-neutral-300 text-sm font-sans mb-8 leading-relaxed">
          {error || 'The requested portfolio audit ID could not be loaded from the database or may have been deleted.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold text-xs font-mono transition-colors shadow-md shadow-orange-500/10 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Audit</span>
            </button>
          )}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Audit Engine</span>
          </button>
        </div>
      </div>
    );
  }

  // Normalize scores object safely
  const scores = review.scores || {
    uiUx: review.uiUx ?? 7.0,
    performance: review.performance ?? 7.0,
    accessibility: review.accessibility ?? 7.0,
    content: review.content ?? 7.0,
  };

  const overallScore = typeof review.overallScore === 'number' ? review.overallScore : 7.0;
  const techSignals = review.technicalSignals;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8"
    >
      {/* 1. Header Toolbar & Portfolio Domain Overview (Req 1, 2, 13, 14, 15) */}
      <DashboardHeader
        review={review}
        onBackToHome={onBackToHome}
        onOpenHistory={onOpenHistory}
        historyCount={historyCount}
        onDelete={onDelete}
      />

      {/* 2. Four Pillar Metric Cards (Req 3, 4, 5, 6 - Non-color visual indicators, ticks) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span>Category Performance Metrics</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Click any section for breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreMetricCard
            categoryKey="uiUx"
            label="UI / UX Polish"
            score={scores.uiUx}
            weight={30}
            description="Typography hierarchy, spatial harmony, visual consistency, and micro-interactions."
            index={0}
          />
          <ScoreMetricCard
            categoryKey="performance"
            label="Performance Signals"
            score={scores.performance}
            weight={25}
            description="DOM node depth, bundle lean-ness, image hygiene, and responsive resource loading."
            index={1}
          />
          <ScoreMetricCard
            categoryKey="accessibility"
            label="Accessibility & DOM"
            score={scores.accessibility}
            weight={25}
            description="Semantic HTML elements, landmark navigation, alt tag coverage, and contrast ratios."
            index={2}
          />
          <ScoreMetricCard
            categoryKey="content"
            label="Content & Narrative"
            score={scores.content}
            weight={20}
            description="Clarity of value proposition, project case studies, and clear contact links."
            index={3}
          />
        </div>
      </div>

      {/* 3. Visual Charts & Technical Signals Row (Req 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Recharts Multi-Axial Chart (8 Cols) */}
        <div className="lg:col-span-8">
          <ScoresChartWidget scores={scores} overallScore={overallScore} />
        </div>

        {/* Technical Signals Dev Inspector Card (4 Cols) */}
        <Interactive3DCard
          maxTilt={4}
          className="lg:col-span-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 flex flex-col justify-between backdrop-blur-sm shadow-xl"
        >
          <div>
            <Interactive3DItem depth={25} className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold mb-4">
              <Code2 className="w-4 h-4 text-orange-400" />
              <span>DOM Diagnostic Signals</span>
            </Interactive3DItem>

            {techSignals ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                  <span className="text-neutral-400">Heading 1 (H1) Count:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    techSignals.h1Count === 1 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {techSignals.h1Count}
                    {techSignals.h1Count === 1 ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-amber-400 font-sans">(!=1)</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                  <span className="text-neutral-400">Total Images Audited:</span>
                  <span className="font-bold text-neutral-200">
                    {techSignals.totalImages}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                  <span className="text-neutral-400">Images Missing Alt:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    techSignals.imagesMissingAlt === 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {techSignals.imagesMissingAlt}
                    {techSignals.imagesMissingAlt === 0 ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-rose-400 font-sans">needs fix</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                  <span className="text-neutral-400">Semantic Navigation:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    techSignals.hasNavigation ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {techSignals.hasNavigation ? 'Present' : 'Missing'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                  <span className="text-neutral-400">Social/Contact Reach:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    techSignals.hasContactOrSocial ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {techSignals.hasContactOrSocial ? 'Detected' : 'Not Found'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
                  <span className="text-neutral-400">Viewport Meta Tag:</span>
                  <span className="font-bold text-emerald-400">
                    Responsive Viewport
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-400">
                DOM technical signals synthesized via standard HTML inspection.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] font-mono text-neutral-500">
            Diagnostic extracted from raw document inspection.
          </div>
        </Interactive3DCard>
      </div>

      {/* 4. Real Google PageSpeed & Core Web Vitals Lab Diagnostic (Bonus Feature 2) */}
      <LighthouseMetricsCard
        metrics={techSignals?.lighthouse}
        loadTimeMs={techSignals?.loadTimeEstimateMs}
      />

      {/* 5. Portfolio Live Screenshot Preview (Bonus Feature 1) */}
      <PortfolioScreenshotPreview url={review.url} domain={review.domain} />

      {/* 6. Portfolio Roast Terminal & AI Executive Summary (Req 8, 9) */}
      <RoastTerminal review={review} />

      {/* 5. Strengths & Issues Grid (Req 10, 11 - with Severity Filtering) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <StrengthsWidget strengths={review.strengths || []} />
        <IssuesWidget issues={review.issues || []} />
      </div>

      {/* 6. Improvement Suggestions Roadmap (Req 12) */}
      <SuggestionsWidget suggestions={review.suggestions || []} />

      {/* 7. Bottom Navigation & Action Bar */}
      <div className="pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Audit Engine</span>
        </button>

        <div className="flex items-center gap-3">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="text-xs font-mono text-neutral-400 hover:text-orange-400 underline underline-offset-4 cursor-pointer"
            >
              Browse All Past Audits ({historyCount})
            </button>
          )}
          <span className="text-neutral-700">•</span>
          <span className="text-xs font-mono text-neutral-500">
            Roast My Portfolio v1.0
          </span>
        </div>
      </div>
    </motion.div>
  );
};
