import React, { useEffect } from 'react';
import { X, History, ExternalLink, ArrowUpRight, Trash2, Calendar } from 'lucide-react';
import { PortfolioReview } from '../../types';
import { ScoreBadge } from '../common/ScoreBadge';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: PortfolioReview[];
  onSelectReview: (review: PortfolioReview) => void;
  onClearHistory: () => void;
  onDeleteReview?: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  reviews,
  onSelectReview,
  onClearHistory,
  onDeleteReview,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 id="history-modal-title" className="text-base font-bold text-neutral-100 font-mono">
                Audit History
              </h3>
              <p className="text-xs text-neutral-400">
                {reviews.length} saved portfolio {reviews.length === 1 ? 'audit' : 'audits'} in session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {reviews.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs font-mono text-neutral-400 hover:text-rose-400 flex items-center gap-1 px-2.5 py-1 rounded hover:bg-neutral-800 transition-colors"
                title="Clear all saved reviews"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="p-5 overflow-y-auto space-y-3 divide-y divide-neutral-800/60">
          {reviews.map((rev) => {
            const formattedDate = new Date(rev.createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={rev.id}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-100 font-mono text-sm group-hover:text-orange-400 transition-colors">
                      {rev.domain}
                    </span>
                    <ScoreBadge score={rev.overallScore} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px] text-neutral-400">
                      {rev.technicalSignals.title || rev.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      onSelectReview(rev);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-mono font-medium transition-colors"
                  >
                    <span>View Report</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  {onDeleteReview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReview(rev.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      title="Delete review from history"
                      aria-label="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {reviews.length === 0 && (
            <div className="text-center py-12 text-neutral-400">
              <History className="w-8 h-8 mx-auto mb-2 text-neutral-500 opacity-60" />
              <p className="text-sm font-mono text-neutral-300">No portfolio reviews yet</p>
              <p className="text-xs text-neutral-400 mt-1">
                Audit any portfolio URL on the home page to start tracking your audit history.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        {reviews.length > 0 && (
          <div className="p-3 bg-neutral-950/80 border-t border-neutral-800 text-center text-[11px] font-mono text-neutral-400">
            Saved locally in your browser session
          </div>
        )}
      </div>
    </div>
  );
};
