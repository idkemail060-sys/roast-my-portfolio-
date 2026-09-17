import React, { useState } from 'react';
import { 
  Lightbulb, 
  CheckSquare, 
  Square, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { AuditSuggestion } from '../../types';
import { Interactive3DCard, Interactive3DItem } from '../common/Interactive3DCard';

interface SuggestionsWidgetProps {
  suggestions: AuditSuggestion[];
}

export const SuggestionsWidget: React.FC<SuggestionsWidgetProps> = ({ suggestions }) => {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [copiedActionItems, setCopiedActionItems] = useState(false);

  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  const toggleComplete = (id: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyActionItems = () => {
    const text = safeSuggestions
      .map((sug, i) => `${i + 1}. [${sug.impact.toUpperCase()} IMPACT] ${sug.title}\n   ${sug.description}`)
      .join('\n\n');
    navigator.clipboard.writeText(`## Actionable Portfolio Remediation Tasks\n\n${text}`);
    setCopiedActionItems(true);
    setTimeout(() => setCopiedActionItems(false), 2200);
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return {
          classes: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          label: '▲ High Impact',
        };
      case 'medium':
        return {
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          label: '● Medium Impact',
        };
      case 'low':
      default:
        return {
          classes: 'bg-neutral-800 text-neutral-300 border-neutral-700',
          label: '▼ Low Impact',
        };
    }
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold mb-1">
            <Lightbulb className="w-4 h-4" />
            <span>ACTIONABLE REMEDIATION ROADMAP ({safeSuggestions.length})</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-100 font-mono">
            Prioritized Engineering Recommendations
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            High-leverage adjustments to quickly boost visual polish, accessibility compliance, and narrative clarity.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {safeSuggestions.length > 0 && (
            <span className="text-xs font-mono text-neutral-400 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800">
              Completed: <strong className="text-emerald-400">{completedCount}</strong> / {safeSuggestions.length}
            </span>
          )}

          <button
            onClick={handleCopyActionItems}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer"
            title="Copy tasks for GitHub issues or Todo list"
          >
            {copiedActionItems ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedActionItems ? 'Copied Tasks!' : 'Export Tasks'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safeSuggestions.map((sug, idx) => {
          const impact = getImpactBadge(sug.impact);
          const isDone = !!completedItems[sug.id];

          return (
            <Interactive3DCard
              key={sug.id}
              maxTilt={5}
              className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isDone
                  ? 'bg-neutral-950/40 border-emerald-500/30 opacity-70'
                  : 'bg-neutral-950/80 border-neutral-800/90 hover:border-neutral-700'
              }`}
            >
              <div>
                <Interactive3DItem depth={20} className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 font-mono text-xs flex items-center justify-center font-bold">
                      #{idx + 1}
                    </span>
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${impact.classes}`}>
                      {impact.label}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleComplete(sug.id)}
                    className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                    title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {isDone ? (
                      <>
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Done</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 text-neutral-500" />
                        <span>Todo</span>
                      </>
                    )}
                  </button>
                </Interactive3DItem>

                <h4 className={`text-sm font-semibold font-mono mb-1.5 transition-colors ${
                  isDone ? 'line-through text-neutral-400' : 'text-neutral-100'
                }`}>
                  {sug.title}
                </h4>

                <p className={`text-xs font-sans leading-relaxed ${
                  isDone ? 'text-neutral-400 line-through' : 'text-neutral-400'
                }`}>
                  {sug.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-orange-400" />
                  Estimated score gain: +0.4 to +1.2
                </span>
                <span className="text-neutral-400">Step {idx + 1}</span>
              </div>
            </Interactive3DCard>
          );
        })}

        {safeSuggestions.length === 0 && (
          <div className="col-span-2 text-center py-8 text-neutral-400 text-xs font-mono border border-dashed border-neutral-800 rounded-xl">
            No specific recommendations required. Portfolio demonstrates high structural quality.
          </div>
        )}
      </div>
    </div>
  );
};
