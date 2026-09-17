import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  Layers
} from 'lucide-react';
import { AuditIssue } from '../../types';
import { Interactive3DCard, Interactive3DItem } from '../common/Interactive3DCard';

interface IssuesWidgetProps {
  issues: AuditIssue[];
}

export const IssuesWidget: React.FC<IssuesWidgetProps> = ({ issues }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

  const safeIssues = Array.isArray(issues) ? issues : [];

  const counts = {
    all: safeIssues.length,
    high: safeIssues.filter((i) => i.severity === 'high').length,
    medium: safeIssues.filter((i) => i.severity === 'medium').length,
    low: safeIssues.filter((i) => i.severity === 'low').length,
  };

  const filteredIssues = safeIssues.filter((issue) => {
    if (selectedSeverity === 'all') return true;
    return issue.severity === selectedSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
          label: 'HIGH SEVERITY',
          tag: '▲ Critical',
          classes: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          accent: 'border-l-rose-500',
        };
      case 'medium':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          label: 'MEDIUM SEVERITY',
          tag: '● Warning',
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          accent: 'border-l-amber-500',
        };
      case 'low':
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-sky-400" />,
          label: 'LOW SEVERITY',
          tag: '▼ Minor',
          classes: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          accent: 'border-l-sky-500',
        };
    }
  };

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'uiUx':
        return 'UI / UX Polish';
      case 'performance':
        return 'Performance';
      case 'accessibility':
        return 'Accessibility';
      case 'content':
        return 'Content Strategy';
      default:
        return cat || 'General Audit';
    }
  };

  return (
    <Interactive3DCard
      maxTilt={4}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between h-full"
    >
      <div>
        {/* Header and Severity Filter Controls */}
        <Interactive3DItem depth={25} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>IDENTIFIED ISSUES & FINDINGS ({safeIssues.length})</span>
          </div>

          {/* Severity Filter Chips */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono shadow-inner">
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                selectedSeverity === 'all'
                  ? 'bg-neutral-800 text-neutral-100 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setSelectedSeverity('high')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                selectedSeverity === 'high'
                  ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                  : 'text-neutral-400 hover:text-rose-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>High ({counts.high})</span>
            </button>
            <button
              onClick={() => setSelectedSeverity('medium')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                selectedSeverity === 'medium'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Med ({counts.medium})</span>
            </button>
            <button
              onClick={() => setSelectedSeverity('low')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                selectedSeverity === 'low'
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                  : 'text-neutral-400 hover:text-sky-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Low ({counts.low})</span>
            </button>
          </div>
        </Interactive3DItem>

        <p className="text-xs text-neutral-400 mb-4">
          Observable defects or friction points discovered during programmatic and visual evaluation:
        </p>

        {/* Issues Accordion / List */}
        <div className="space-y-3">
          {filteredIssues.map((issue) => {
            const badge = getSeverityBadge(issue.severity);
            const isExpanded = expandedIssueId === issue.id;

            return (
              <div
                key={issue.id}
                className={`rounded-xl border border-neutral-800/90 bg-neutral-950/70 p-4 transition-all hover:border-neutral-700 ${badge.accent} border-l-3`}
              >
                <div 
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${badge.classes}`}>
                        {badge.icon}
                        <span>{badge.tag}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                        <Layers className="w-2.5 h-2.5" />
                        <span>{getCategoryName(issue.category)}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-neutral-100 font-mono pt-1">
                      {issue.title}
                    </h4>
                  </div>

                  <button 
                    className="text-neutral-500 hover:text-neutral-300 p-1 shrink-0"
                    aria-label={isExpanded ? "Collapse issue description" : "Expand issue description"}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                <div className={`mt-2 text-xs text-neutral-300 font-sans leading-relaxed pt-2 border-t border-neutral-800/60 ${isExpanded ? 'block' : 'line-clamp-2'}`}>
                  {issue.description}
                </div>
              </div>
            );
          })}

          {filteredIssues.length === 0 && (
            <div className="text-center py-10 text-neutral-400 text-xs font-mono border border-dashed border-neutral-800 rounded-xl">
              No issues recorded under the "{selectedSeverity}" severity filter.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-500 flex items-center justify-between">
        <span>Prioritize High Severity items first</span>
        <span>Resolution impacts Overall score</span>
      </div>
    </Interactive3DCard>
  );
};
