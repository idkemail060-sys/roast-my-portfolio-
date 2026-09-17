import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Share2, 
  Check, 
  History, 
  Trash2, 
  Calendar,
  Globe,
  Award
} from 'lucide-react';
import { PortfolioReview } from '../../types';

interface DashboardHeaderProps {
  review: PortfolioReview;
  onBackToHome: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  onDelete?: (id: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  review,
  onBackToHome,
  onOpenHistory,
  historyCount = 0,
  onDelete,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?review=${encodeURIComponent(review.id)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    if (window.confirm(`Are you sure you want to delete the audit report for ${review.domain}?`)) {
      setIsDeleting(true);
      try {
        await onDelete(review.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Humanized timestamp formatting
  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  const overallScore = typeof review.overallScore === 'number' ? review.overallScore : 7.0;

  // Grade badge & accessible status (not just color)
  let gradeBadge = {
    grade: 'A',
    label: 'EXCELLENT',
    borderClasses: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    indicator: '★ Top Tier',
  };

  if (overallScore >= 8.5) {
    gradeBadge = {
      grade: 'A',
      label: 'EXCELLENT',
      borderClasses: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
      indicator: '★ Top Tier',
    };
  } else if (overallScore >= 7.0) {
    gradeBadge = {
      grade: 'B',
      label: 'GOOD',
      borderClasses: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
      indicator: '● Solid Baseline',
    };
  } else if (overallScore >= 5.0) {
    gradeBadge = {
      grade: 'C',
      label: 'NEEDS WORK',
      borderClasses: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
      indicator: '▲ Action Required',
    };
  } else {
    gradeBadge = {
      grade: 'D',
      label: 'CRITICAL',
      borderClasses: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
      indicator: '✕ Major Friction',
    };
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Back to Home, History Access, Share, Delete) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </button>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-orange-400" />
              <span>Review History</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-[10px] text-neutral-300 font-bold">
                  {historyCount}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Timestamp Badge */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-900">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden md:inline">Audited:</span>
            <span>{formattedDate}</span>
          </div>

          {/* Share Permlink Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer"
            title="Copy shareable permalink to clipboard"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          {/* Delete Audit Button */}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-rose-900/80 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
              title="Delete audit from database"
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Portfolio Overview Banner */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Subtle glowing corner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20 font-semibold">
                <Globe className="w-3 h-3" />
                Live Portfolio Review
              </span>

              <span className="text-[11px] font-mono text-neutral-500">
                ID: <span className="text-neutral-400">{review.id}</span>
              </span>
            </div>

            {/* Domain & Live Link */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight font-mono flex items-center gap-3 flex-wrap">
                <span>{review.domain}</span>
                <a
                  href={review.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-normal text-neutral-400 hover:text-orange-400 px-3 py-1 rounded-md bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors"
                >
                  <span>Visit Live</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-mono mt-1.5 truncate">
                Target URL: <span className="text-neutral-300">{review.url}</span>
              </p>
            </div>
          </div>

          {/* Prominent Overall Score Card */}
          <div className="flex items-center gap-5 p-4 sm:p-5 rounded-xl bg-neutral-950/90 border border-neutral-800 self-stretch sm:self-auto justify-center sm:justify-start shrink-0 shadow-lg">
            {/* Score Big Display */}
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400">
                {overallScore.toFixed(1)}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mt-1">
                OVERALL SCORE
              </div>
              <div className="text-[11px] font-mono text-neutral-400">
                Out of 10.0
              </div>
            </div>

            <div className="h-14 w-px bg-neutral-800" />

            {/* Accessible Grade & Status Indicators */}
            <div className="space-y-1.5 text-left">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border ${gradeBadge.borderClasses}`}>
                <Award className="w-3.5 h-3.5" />
                <span>Grade {gradeBadge.grade} • {gradeBadge.label}</span>
              </div>
              <div className="text-[11px] font-mono text-neutral-400 block pl-0.5">
                {gradeBadge.indicator}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 block pl-0.5">
                Weighted 4-pillar index
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
