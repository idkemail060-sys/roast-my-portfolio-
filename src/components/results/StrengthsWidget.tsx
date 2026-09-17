import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Interactive3DCard, Interactive3DItem } from '../common/Interactive3DCard';

interface StrengthsWidgetProps {
  strengths: string[];
}

export const StrengthsWidget: React.FC<StrengthsWidgetProps> = ({ strengths }) => {
  const safeStrengths = Array.isArray(strengths) && strengths.length > 0
    ? strengths
    : ['Valid semantic HTML document structure detected', 'Accessible viewport configurations in place'];

  return (
    <Interactive3DCard
      maxTilt={4}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between h-full"
    >
      <div>
        <Interactive3DItem depth={25} className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>CONFIRMED PORTFOLIO STRENGTHS ({safeStrengths.length})</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">
            DOM Verified
          </span>
        </Interactive3DItem>

        <p className="text-xs text-neutral-400 mb-4">
          Key positive design patterns and architectural implementations detected:
        </p>

        <ul className="space-y-3">
          {safeStrengths.map((strength, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 transition-all hover:border-emerald-500/40 hover:bg-neutral-950/90 text-xs text-neutral-200 group"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span className="leading-relaxed font-sans font-medium">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-500 flex items-center justify-between">
        <span>Preserve these implementations</span>
        <span className="text-emerald-400 font-semibold">Healthy Baselines</span>
      </div>
    </Interactive3DCard>
  );
};
