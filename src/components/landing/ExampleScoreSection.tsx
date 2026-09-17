import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';
import { Flame, ExternalLink, ArrowUpRight, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { MOCK_REVIEWS } from '../../data/mockData';
import { ScoreBadge } from '../common/ScoreBadge';
import { PortfolioReview } from '../../types';
import { Interactive3DCard, Interactive3DItem } from '../common/Interactive3DCard';

interface ExampleScoreSectionProps {
  onSelectReview: (review: PortfolioReview) => void;
  reviews?: PortfolioReview[];
}

export const ExampleScoreSection: React.FC<ExampleScoreSectionProps> = ({
  onSelectReview,
  reviews = [],
}) => {
  const displayList = reviews.length > 0 ? reviews.slice(0, 4) : MOCK_REVIEWS;
  const [selectedIdx, setSelectedIdx] = useState(0);

  const activeIdx = Math.min(selectedIdx, displayList.length - 1);
  const currentReview = displayList[activeIdx] || MOCK_REVIEWS[0];

  const scores = currentReview.scores || {
    uiUx: currentReview.uiUx ?? 7.0,
    performance: currentReview.performance ?? 7.0,
    accessibility: currentReview.accessibility ?? 7.0,
    content: currentReview.content ?? 7.0,
  };

  const overallScore = typeof currentReview.overallScore === 'number' ? currentReview.overallScore : 7.0;

  // Transform scores for Recharts Radar chart
  const radarData = [
    { subject: 'UI / UX', score: scores.uiUx, fullMark: 10 },
    { subject: 'Performance', score: scores.performance, fullMark: 10 },
    { subject: 'Accessibility', score: scores.accessibility, fullMark: 10 },
    { subject: 'Content', score: scores.content, fullMark: 10 },
  ];

  const techTitle = currentReview.technicalSignals?.title || currentReview.domain;
  const strengths = Array.isArray(currentReview.strengths) ? currentReview.strengths : [];
  const issues = Array.isArray(currentReview.issues) ? currentReview.issues : [];
  const suggestions = Array.isArray(currentReview.suggestions) ? currentReview.suggestions : [];

  return (
    <section id="examples" className="py-20 border-t border-neutral-900 bg-neutral-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {reviews.length > 0 ? 'Live Database Audits' : 'Audit Showcase'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 mt-4 tracking-tight">
            Recent Audit Reports
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-3 leading-relaxed">
            See how the engine audits different portfolio archetypes—from senior engineering showcases to template starter sites.
          </p>

          {/* Archetype Selector Tabs */}
          <div className="mt-8 inline-flex flex-wrap justify-center p-1 rounded-xl bg-neutral-900 border border-neutral-800 gap-1">
            {displayList.map((rev, i) => (
              <button
                key={rev.id}
                onClick={() => setSelectedIdx(i)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                  activeIdx === i
                    ? 'bg-neutral-800 text-orange-400 font-bold shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>{rev.domain}</span>
                <span className="text-[10px] opacity-70">({(rev.overallScore ?? 7).toFixed(1)})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3D Audit Dashboard Card Preview */}
        <Interactive3DCard
          maxTilt={5}
          className="rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-2xl overflow-hidden backdrop-blur-sm"
        >
          {/* Card Header */}
          <div className="border-b border-neutral-800 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-900/90">
            <Interactive3DItem depth={30} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-lg font-mono shadow-inner">
                {overallScore.toFixed(1)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-100 font-mono">
                    {currentReview.domain}
                  </h3>
                  <a
                    href={currentReview.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-400 hover:text-neutral-300"
                    title="Open Portfolio Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-neutral-400 truncate max-w-md">
                  {techTitle}
                </p>
              </div>
            </Interactive3DItem>

            <Interactive3DItem depth={25} className="flex items-center gap-3 self-end sm:self-center">
              <ScoreBadge score={overallScore} size="md" showLabel />
              <button
                onClick={() => onSelectReview(currentReview)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 transition-colors cursor-pointer"
              >
                <span>View Full Report</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </Interactive3DItem>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Scores & Radar Chart (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              {/* Category Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Interactive3DItem depth={20} className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-950/60">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                    UI / UX Polish (30%)
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-neutral-100">
                      {scores.uiUx.toFixed(1)}
                    </span>
                    <ScoreBadge score={scores.uiUx} size="sm" />
                  </div>
                </Interactive3DItem>

                <Interactive3DItem depth={20} className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-950/60">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                    Performance (25%)
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-neutral-100">
                      {scores.performance.toFixed(1)}
                    </span>
                    <ScoreBadge score={scores.performance} size="sm" />
                  </div>
                </Interactive3DItem>

                <Interactive3DItem depth={20} className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-950/60">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                    Accessibility (25%)
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-neutral-100">
                      {scores.accessibility.toFixed(1)}
                    </span>
                    <ScoreBadge score={scores.accessibility} size="sm" />
                  </div>
                </Interactive3DItem>

                <Interactive3DItem depth={20} className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-950/60">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                    Content Depth (20%)
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-neutral-100">
                      {scores.content.toFixed(1)}
                    </span>
                    <ScoreBadge score={scores.content} size="sm" />
                  </div>
                </Interactive3DItem>
              </div>

              {/* Radar Chart */}
              <div className="h-56 w-full flex items-center justify-center p-2 rounded-xl bg-neutral-950/80 border border-neutral-800">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#262626" />
                    <PolarAngleAxis dataKey="subject" stroke="#a3a3a3" tick={{ fontSize: 11, fill: '#a3a3a3' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#525252" tick={{ fontSize: 9 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.4}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        borderColor: '#404040',
                        fontSize: '12px',
                        color: '#f5f5f5',
                        borderRadius: '6px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Col: Roast Quote & Insights Preview (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              {/* Humorous Constructive Roast */}
              <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-orange-950/20 p-5">
                <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-semibold mb-2">
                  <Flame className="w-4 h-4" />
                  <span>THE PORTFOLIO ROAST</span>
                </div>
                <blockquote className="text-base sm:text-lg font-mono text-neutral-100 font-medium leading-relaxed italic border-l-2 border-orange-500 pl-3.5 my-2">
                  "{currentReview.roast || 'A portfolio so quiet even git status had to double check if you exist.'}"
                </blockquote>
                <p className="text-xs text-neutral-400 mt-3 font-sans">
                  {currentReview.summary || 'DOM inspection and AI review completed.'}
                </p>
              </div>

              {/* Sample Findings Preview */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Key Strengths Identified ({strengths.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {strengths.slice(0, 2).map((str, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-neutral-300 p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80 truncate"
                      >
                        • {str}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Top Audit Flag ({issues.length} total)</span>
                  </h4>
                  {issues[0] ? (
                    <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-neutral-200 font-mono">
                          {issues[0].title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          {issues[0].severity}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2">
                        {issues[0].description}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-400 p-2">No critical flags noted.</div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Remediation Roadmap</span>
                  </h4>
                  {suggestions[0] ? (
                    <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-neutral-200 font-mono">
                          {suggestions[0].title}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Impact: {suggestions[0].impact}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-2">
                        {suggestions[0].description}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Interactive3DCard>
      </div>
    </section>
  );
};
