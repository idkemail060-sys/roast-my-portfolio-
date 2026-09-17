import React from 'react';
import { 
  Code2, 
  Sparkles, 
  ShieldCheck, 
  Scale, 
  Eye, 
  ListOrdered, 
  Layers, 
  Terminal 
} from 'lucide-react';
import { Interactive3DCard, Interactive3DItem } from '../common/Interactive3DCard';

export const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: <Eye className="w-5 h-5 text-orange-400" />,
      title: 'Observable DOM Extraction',
      description: 'Parses genuine page titles, meta descriptions, H1/H2/H3 hierarchies, button states, and counts uncaptioned project images. Never fabricates imaginary page features.',
      tag: 'HTML Inspection'
    },
    {
      icon: <Scale className="w-5 h-5 text-amber-400" />,
      title: 'Deterministic Weighted Scoring',
      description: 'Scores are not an uncontrolled AI hallucination. Category metrics are calculated via a documented formula: (UI × 0.30) + (Perf × 0.25) + (A11y × 0.25) + (Content × 0.20).',
      tag: 'Transparent Logic'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      title: 'Constructive Developer Roasts',
      description: 'Delivers witty, developer-fluent roasts that poke fun at common portfolio tropes (like unpushed git commits and 99% proficiency bars) while providing genuine mentorship.',
      tag: 'Witty & Constructive'
    },
    {
      icon: <ListOrdered className="w-5 h-5 text-cyan-400" />,
      title: 'Severity-Ranked Suggestions',
      description: 'Action items are prioritized by High, Medium, and Low severity with concrete remediation steps—from converting 4MB hero PNGs into WebP to adding screen-reader labels.',
      tag: 'Actionable Roadmaps'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-violet-400" />,
      title: 'SSRF & Protocol Security',
      description: 'Restricts outgoing requests to valid public HTTP/HTTPS endpoints. Strictly denies loopbacks (localhost, 127.0.0.1) and private internal network subnets.',
      tag: 'Security Awareness'
    },
    {
      icon: <Terminal className="w-5 h-5 text-rose-400" />,
      title: 'Production-Grade Architecture',
      description: 'Structured with clean code boundaries. Every module—from scraping to prompt engineering to report synthesis—is modular, secure, and easily extensible.',
      tag: 'Modular Design'
    },
  ];

  return (
    <section id="features" className="py-20 border-t border-neutral-900 bg-neutral-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-sm">
            Engine Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 mt-4 tracking-tight">
            Engineered for Real Developers
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-3 leading-relaxed">
            Unlike shallow AI wrapper tools that output generic praise, Roast My Portfolio evaluates technical structure and provides real engineering value.
          </p>
        </div>

        {/* 3D Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => (
            <Interactive3DCard
              key={item.title}
              maxTilt={8}
              className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-6 hover:border-neutral-600 transition-colors group flex flex-col justify-between backdrop-blur-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Interactive3DItem depth={30}>
                    <div className="w-10 h-10 rounded-lg bg-neutral-800/90 border border-neutral-700/60 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                  </Interactive3DItem>
                  <Interactive3DItem depth={20}>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                      {item.tag}
                    </span>
                  </Interactive3DItem>
                </div>

                <Interactive3DItem depth={25}>
                  <h3 className="text-base font-bold text-neutral-100 mb-2 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </Interactive3DItem>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </section>
  );
};
