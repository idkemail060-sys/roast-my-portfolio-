import React from 'react';
import { Globe, Code, Cpu, FileCheck2, ArrowRight } from 'lucide-react';
import { Interactive3DCard, Interactive3DItem } from '../common/Interactive3DCard';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'URL Validation & Security Checks',
      description: 'The backend verifies HTTP/HTTPS protocol, resolves hostnames, and enforces SSRF protection to block private networks (localhost, 127.0.0.1, RFC 1918 subnets).',
      badge: 'Security Layer',
      icon: <Globe className="w-5 h-5 text-orange-400" />,
      detail: 'Request timeout: 8s • Max payload: 5MB',
    },
    {
      step: '02',
      title: 'Public DOM & Structural Parsing',
      description: 'Cheerio fetches the publicly accessible HTML to extract real observable data: title, meta descriptions, H1/H2/H3 hierarchy, image count, missing alt tags, links, and viewport metadata.',
      badge: 'Cheerio Parser',
      icon: <Code className="w-5 h-5 text-amber-400" />,
      detail: 'Distinguishes observable facts from speculation',
    },
    {
      step: '03',
      title: 'Structured Gemini AI Assessment',
      description: 'Extracted structural facts are sent to Gemini with strict JSON schema constraints. The AI acts as a seasoned senior engineer evaluating UI/UX, responsiveness indicators, and developer branding.',
      badge: 'Gemini 2.5 Flash',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      detail: 'Strict JSON schema • Server-side secret key',
    },
    {
      step: '04',
      title: 'Weighted Scoring & Actionable Roast',
      description: 'Backend business logic calculates the overall score deterministically: (UI/UX × 0.30) + (Performance × 0.25) + (Accessibility × 0.25) + (Content × 0.20), rounded to 1 decimal point.',
      badge: 'Formula Engine',
      icon: <FileCheck2 className="w-5 h-5 text-cyan-400" />,
      detail: 'Overall = 30% UI + 25% Perf + 25% A11y + 20% Content',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 border-t border-neutral-900 bg-neutral-950/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 shadow-sm">
            System Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 mt-4 tracking-tight">
            How Roast My Portfolio Works
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-3 leading-relaxed">
            A transparent 4-stage pipeline connecting secure URL scraping, semantic HTML analysis, server-side Gemini intelligence, and deterministic scoring.
          </p>
        </div>

        {/* 3D Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => (
            <Interactive3DCard
              key={item.step}
              maxTilt={9}
              className="rounded-xl border border-neutral-800/80 bg-neutral-900/70 p-6 flex flex-col justify-between hover:border-orange-500/40 transition-colors group backdrop-blur-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Interactive3DItem depth={30}>
                    <span className="font-mono text-3xl font-extrabold text-neutral-500 group-hover:text-orange-400 transition-colors">
                      {item.step}
                    </span>
                  </Interactive3DItem>
                  <Interactive3DItem depth={35}>
                    <div className="w-10 h-10 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center shadow-inner group-hover:border-orange-500/50 transition-colors">
                      {item.icon}
                    </div>
                  </Interactive3DItem>
                </div>

                <Interactive3DItem depth={20} className="mb-2">
                  <span className="text-[11px] font-mono text-orange-400/90 uppercase tracking-wider font-semibold">
                    {item.badge}
                  </span>
                  <h3 className="text-base font-bold text-neutral-100 mt-1 mb-2">
                    {item.title}
                  </h3>
                </Interactive3DItem>

                <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-400">
                {item.detail}
              </div>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </section>
  );
};
