import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Flame, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Copy, 
  Check, 
  Share2, 
  Clock, 
  Code, 
  Layers, 
  Compass, 
  Sparkles,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { PortfolioReview, IssueSeverity } from '../../types';
import { ScoreBadge } from '../common/ScoreBadge';

interface DashboardViewProps {
  review: PortfolioReview;
  onBack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  review,
  onBack,
}) => {
  const [copiedRoast, setCopiedRoast] = useState(false);
  const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const radarData = [
    { category: 'UI / UX', score: review.scores.uiUx, weight: '30%' },
    { category: 'Performance', score: review.scores.performance, weight: '25%' },
    { category: 'Accessibility', score: review.scores.accessibility, weight: '25%' },
    { category: 'Content Depth', score: review.scores.content, weight: '20%' },
  ];

  const barData = [
    { name: 'UI / UX', score: review.scores.uiUx, color: '#f97316' },
    { name: 'Perf', score: review.scores.performance, color: '#38bdf8' },
    { name: 'A11y', score: review.scores.accessibility, color: '#a855f7' },
    { name: 'Content', score: review.scores.content, color: '#34d399' },
  ];

  const handleCopyRoast = () => {
    navigator.clipboard.writeText(`"${review.roast}" — Roast My Portfolio on ${review.domain}`);
    setCopiedRoast(true);
    setTimeout(() => setCopiedRoast(false), 2000);
  };

  const filteredIssues = review.issues.filter((iss) => {
    if (selectedSeverity === 'all') return true;
    return iss.severity === selectedSeverity;
  });

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-neutral-950 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-neutral-100 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Audit Another Portfolio</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Audited on {formattedDate}</span>
            </div>
            <button
              onClick={handleCopyRoast}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-neutral-100 transition-colors"
            >
              {copiedRoast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRoast ? 'Roast Copied!' : 'Copy Roast'}</span>
            </button>
          </div>
        </div>

        {/* Portfolio Overview Banner */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-orange-400 uppercase tracking-wider mb-2">
                <span>Domain Inspection Report</span>
                <span>•</span>
                <span className="text-neutral-400">ID: {review.id}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-100 flex items-center gap-3 flex-wrap">
                <span>{review.domain}</span>
                <a
                  href={review.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono font-normal text-neutral-400 hover:text-orange-400 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Visit Live</span>
                </a>
              </h1>
              <p className="text-sm text-neutral-400 mt-2 max-w-3xl">
                {review.technicalSignals.title || 'Portfolio Website'}
              </p>
            </div>

            {/* Main Score Dial */}
            <div className="flex items-center gap-4 bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 self-stretch sm:self-auto justify-center">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-400">
                  {review.overallScore.toFixed(1)}
                </div>
                <span className="text-[11px] font-mono text-neutral-400 block mt-1">
                  OVERALL SCORE (/10)
                </span>
              </div>
              <div className="h-10 w-px bg-neutral-800" />
              <div className="text-left space-y-1">
                <ScoreBadge score={review.overallScore} size="sm" showLabel />
                <span className="text-[10px] font-mono text-neutral-400 block">
                  Weighted Formula
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Humorous Constructive Roast Terminal */}
        <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-orange-950/20 p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-mono text-xs text-orange-400 font-semibold">
              <Flame className="w-4 h-4 fill-orange-400/20" />
              <span>THE PORTFOLIO ROAST</span>
            </div>
            <button
              onClick={handleCopyRoast}
              className="text-xs font-mono text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5"
            >
              {copiedRoast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRoast ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          <blockquote className="text-lg sm:text-2xl font-mono text-neutral-100 font-medium leading-snug border-l-3 border-orange-500 pl-4 my-3">
            "{review.roast}"
          </blockquote>

          <div className="mt-5 pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-400">
            <p className="font-sans leading-relaxed">
              <strong className="text-neutral-300">Auditor Summary:</strong> {review.summary}
            </p>
            <span className="text-[11px] font-mono text-neutral-400 shrink-0">
              Gemini 2.5 Flash • Developer Persona
            </span>
          </div>
        </div>

        {/* 4 Category Score Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
              <span>UI / UX Polish</span>
              <span className="text-neutral-400">30% weight</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-extrabold font-mono text-neutral-100">
                {review.scores.uiUx.toFixed(1)}
              </span>
              <ScoreBadge score={review.scores.uiUx} size="sm" />
            </div>
            <p className="text-xs text-neutral-400">
              Visual hierarchy, contrast ratios, and spatial rhythm.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
              <span>Performance Signals</span>
              <span className="text-neutral-400">25% weight</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-extrabold font-mono text-neutral-100">
                {review.scores.performance.toFixed(1)}
              </span>
              <ScoreBadge score={review.scores.performance} size="sm" />
            </div>
            <p className="text-xs text-neutral-400">
              Observable asset weights, script footprints, and viewport tags.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
              <span>Accessibility & DOM</span>
              <span className="text-neutral-400">25% weight</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-extrabold font-mono text-neutral-100">
                {review.scores.accessibility.toFixed(1)}
              </span>
              <ScoreBadge score={review.scores.accessibility} size="sm" />
            </div>
            <p className="text-xs text-neutral-400">
              Image alt tags, heading semantic nesting, and navigation markers.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
              <span>Content & Narrative</span>
              <span className="text-neutral-400">20% weight</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-extrabold font-mono text-neutral-100">
                {review.scores.content.toFixed(1)}
              </span>
              <ScoreBadge score={review.scores.content} size="sm" />
            </div>
            <p className="text-xs text-neutral-400">
              Case study depth, live links, and developer identity clarity.
            </p>
          </div>
        </div>

        {/* Charts & Observable Technical Signals Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart Card (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-neutral-100 font-mono">
                  Category Score Breakdown
                </h3>
                <p className="text-xs text-neutral-400">
                  Visualization of relative category strengths
                </p>
              </div>

              {/* Chart Type Toggle */}
              <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-lg">
                <button
                  onClick={() => setChartType('radar')}
                  className={`p-1.5 rounded text-xs font-mono flex items-center gap-1 ${
                    chartType === 'radar'
                      ? 'bg-neutral-800 text-orange-400'
                      : 'text-neutral-400 hover:text-neutral-300'
                  }`}
                  title="Radar Chart"
                >
                  <PieChart className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Radar</span>
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-1.5 rounded text-xs font-mono flex items-center gap-1 ${
                    chartType === 'bar'
                      ? 'bg-neutral-800 text-orange-400'
                      : 'text-neutral-400 hover:text-neutral-300'
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bar</span>
                </button>
              </div>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {chartType === 'radar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#262626" />
                    <PolarAngleAxis dataKey="category" stroke="#a3a3a3" tick={{ fontSize: 12, fill: '#a3a3a3' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#525252" tick={{ fontSize: 10 }} />
                    <Radar
                      name="Category Score"
                      dataKey="score"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.35}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        borderColor: '#404040',
                        fontSize: '12px',
                        color: '#f5f5f5',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#737373" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 10]} stroke="#737373" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        borderColor: '#404040',
                        fontSize: '12px',
                        color: '#f5f5f5',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
              <span>Formula: (UI × 0.30) + (Perf × 0.25) + (A11y × 0.25) + (Content × 0.20)</span>
              <span className="text-emerald-400 font-bold">100% Deterministic</span>
            </div>
          </div>

          {/* Observable DOM Technical Signals Card (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs text-cyan-400 font-semibold">
                <Code className="w-4 h-4" />
                <span>OBSERVABLE DOM SIGNALS</span>
              </div>
              <h3 className="text-base font-bold text-neutral-100 font-mono mb-1">
                HTML Inspection Facts
              </h3>
              <p className="text-xs text-neutral-400 mb-4">
                Extracted directly by Cheerio scraper from accessible markup.
              </p>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400">H1 Headings</span>
                  <span className={review.technicalSignals.h1Count === 1 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {review.technicalSignals.h1Count} {review.technicalSignals.h1Count === 1 ? '(Optimal)' : '(Flagged)'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400">Total Images</span>
                  <span className="text-neutral-200">
                    {review.technicalSignals.totalImages} images
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400">Missing Alt Attributes</span>
                  <span className={review.technicalSignals.imagesMissingAlt === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {review.technicalSignals.imagesMissingAlt} of {review.technicalSignals.totalImages}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400">Viewport Meta Tag</span>
                  <span className={review.technicalSignals.hasViewportMeta ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {review.technicalSignals.hasViewportMeta ? 'Present' : 'Missing'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400">Total Outbound Links</span>
                  <span className="text-neutral-200 font-mono">
                    {review.technicalSignals.totalLinks} links
                  </span>
                </div>
              </div>
            </div>

            {review.technicalSignals.detectedTechnologies && review.technicalSignals.detectedTechnologies.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-800">
                <span className="text-[11px] font-mono text-neutral-400 block mb-2">
                  Detected Stack Clues:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {review.technicalSignals.detectedTechnologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-800 border border-neutral-700 text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Strengths and Prioritized Issues Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Strengths (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>CONFIRMED PORTFOLIO STRENGTHS ({review.strengths.length})</span>
            </div>
            <ul className="space-y-3">
              {review.strengths.map((str, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 text-xs text-neutral-200"
                >
                  <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Issues by Severity (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>AUDIT ISSUES & FINDINGS ({review.issues.length})</span>
              </div>

              {/* Severity Filter Tabs */}
              <div className="flex items-center gap-1 text-[11px] font-mono p-1 bg-neutral-950 border border-neutral-800 rounded-lg">
                {['all', 'high', 'medium', 'low'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      selectedSeverity === sev
                        ? 'bg-neutral-800 text-neutral-100 font-bold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredIssues.map((issue) => {
                const badgeColor =
                  issue.severity === 'high'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : issue.severity === 'medium'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700';

                return (
                  <div
                    key={issue.id}
                    className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-neutral-100 font-mono">
                        {issue.title}
                      </h4>
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                      {issue.description}
                    </p>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block pt-1">
                      Category: {issue.category}
                    </span>
                  </div>
                );
              })}

              {filteredIssues.length === 0 && (
                <div className="text-center py-8 text-neutral-400 text-xs font-mono">
                  No issues found with severity: {selectedSeverity}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actionable Improvement Roadmap */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold mb-2">
            <Lightbulb className="w-4 h-4" />
            <span>ACTIONABLE REMEDIATION ROADMAP</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-100 tracking-tight mb-6">
            Prioritized Engineering Suggestions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {review.suggestions.map((sug, idx) => (
              <div
                key={sug.id}
                className="p-5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-orange-400 font-bold">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                      Impact: {sug.impact}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-100 mb-1.5">
                    {sug.title}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {sug.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
