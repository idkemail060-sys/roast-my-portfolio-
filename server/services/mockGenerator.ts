import { PortfolioReview } from '../../src/types';

/**
 * Generates structured, deterministic-feeling audit reviews based on the target URL/domain.
 * Prepared to be replaced by website scraping (Phase 3) and Gemini API prompt evaluation (Phase 4).
 */
export function generateMockReviewForUrl(url: string, domain: string): PortfolioReview {
  // Simple hash for deterministic variations per domain
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash << 5) - hash + domain.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const uiUx = Number((6.8 + (absHash % 28) / 10).toFixed(1));
  const performance = Number((6.4 + ((absHash >> 2) % 32) / 10).toFixed(1));
  const accessibility = Number((5.8 + ((absHash >> 3) % 36) / 10).toFixed(1));
  const content = Number((7.0 + ((absHash >> 4) % 25) / 10).toFixed(1));

  // Weighted score calculation: UI/UX 30%, Performance 25%, Accessibility 25%, Content 20%
  const overall = Number(
    (uiUx * 0.30 + performance * 0.25 + accessibility * 0.25 + content * 0.20).toFixed(1)
  );

  const detectedTechsPool = [
    ['React', 'Tailwind CSS', 'Vercel', 'Next.js'],
    ['Vue.js', 'Vite', 'Netlify', 'Pinia'],
    ['Astro', 'Tailwind CSS', 'Cloudflare Pages'],
    ['TypeScript', 'HTML5', 'Sass', 'GitHub Pages'],
  ];
  const detectedTechnologies = detectedTechsPool[absHash % detectedTechsPool.length];

  const roastOptions = [
    `Your portfolio has more subtle CSS animations than actual deployed projects. Recruiters came for your code, not a 4-second bouncing SVG intro!`,
    `A clean aesthetic, but your hero section is playing hide-and-seek and your project cards are more mysterious than legacy undocumented code.`,
    `Great typography, but your Lighthouse score is sweating from three uncompressed 4MB desktop wallpapers masquerading as project previews!`,
    `Solid developer presence, though your "About Me" reads like a LinkedIn bio written by an over-enthusiastic corporate marketer.`,
  ];
  const roast = roastOptions[absHash % roastOptions.length];

  const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return {
    id,
    url,
    domain,
    overallScore: overall,
    scores: {
      uiUx,
      performance,
      accessibility,
      content,
    },
    summary: `Audit completed for ${domain}. The site exhibits modern visual styling and clean responsive viewport controls, with key optimization opportunities in image compression and landmark semantics.`,
    roast,
    strengths: [
      `Secure HTTPS protocol with valid TLS certificate on ${domain}`,
      'Clean typography hierarchy across primary project showcase sections',
      'Effective responsive viewport meta tag configuration for mobile devices',
      'Accessible outbound contact links and developer profile links (GitHub / LinkedIn)',
    ],
    issues: [
      {
        id: `${id}_iss_1`,
        title: 'Missing Image Alt Attributes',
        severity: 'high',
        description: 'Screen readers encounter image assets lacking alternative descriptive text.',
        category: 'accessibility',
      },
      {
        id: `${id}_iss_2`,
        title: 'Uncompressed Visual Asset Payloads',
        severity: 'medium',
        description: 'Several graphic previews are delivered in raw uncompressed format rather than WebP/AVIF.',
        category: 'performance',
      },
      {
        id: `${id}_iss_3`,
        title: 'Contrast Ratio on Tertiary Metadata Labels',
        severity: 'medium',
        description: 'Muted gray text elements on project cards fail the WCAG AA minimum 4.5:1 ratio threshold.',
        category: 'uiUx',
      },
      {
        id: `${id}_iss_4`,
        title: 'Unquantified Project Descriptions',
        severity: 'low',
        description: 'Project blurbs focus primarily on tech stack lists rather than business impact or engineering metrics.',
        category: 'content',
      },
    ],
    suggestions: [
      {
        id: `${id}_sug_1`,
        title: 'Add Descriptive Alt Descriptions to Project Thumbnails',
        description: 'Provide clear, contextual text alternatives for all graphical previews.',
        impact: 'high',
      },
      {
        id: `${id}_sug_2`,
        title: 'Adopt Next-Gen Image Formats (WebP / AVIF)',
        description: 'Reduce asset payload sizes by 40-70% to boost mobile First Contentful Paint.',
        impact: 'medium',
      },
      {
        id: `${id}_sug_3`,
        title: 'Include Measurable Engineering Metrics',
        description: 'Add specific latency cuts, user volume, or architecture choices to project case studies.',
        impact: 'medium',
      },
    ],
    technicalSignals: {
      title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} — Developer Portfolio`,
      hasMetaDescription: true,
      h1Count: 1,
      headingsCount: 14,
      totalImages: 9,
      imagesMissingAlt: 3,
      totalLinks: 22,
      hasNavigation: true,
      hasContactOrSocial: true,
      hasViewportMeta: true,
      loadTimeEstimateMs: 980 + (absHash % 600),
      detectedTechnologies,
    },
    createdAt: new Date().toISOString(),
  };
}
