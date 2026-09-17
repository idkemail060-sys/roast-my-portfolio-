import { PortfolioReview } from '../types';

export const MOCK_REVIEWS: PortfolioReview[] = [
  {
    id: 'rev-alexchen-dev',
    url: 'https://alexchen.dev',
    domain: 'alexchen.dev',
    overallScore: 7.8,
    scores: {
      uiUx: 8.5,
      performance: 7.1,
      accessibility: 6.8,
      content: 8.0,
    },
    summary: 'A sleek, modern developer portfolio with crisp typography and subtle interactions, but plagued by unoptimized hero assets and missing image alt tags.',
    roast: 'Your portfolio looks cleaner than a fresh OS install, but your hero section is hiding harder than your unpushed Git commits. Also, your contact button scrolls to an empty footer like a developer running away from Jira tickets.',
    strengths: [
      'Clean visual hierarchy with restrained, professional color palette',
      'Concise project highlights with live demo and GitHub repository links',
      'Responsive navigation bar with smooth section anchors',
      'Modern tech stack badge presentation without buzzword soup'
    ],
    issues: [
      {
        id: 'iss-1',
        title: 'Hero Banner Uncompressed 3.8MB PNG',
        severity: 'high',
        description: 'The main hero background is a 3840x2160 unoptimized PNG that adds 2.1s of initial render delay on mobile networks.',
        category: 'performance'
      },
      {
        id: 'iss-2',
        title: '6 of 8 Project Screenshots Missing Alt Attributes',
        severity: 'high',
        description: 'Screen readers encounter empty images without contextual description for your flagship applications.',
        category: 'accessibility'
      },
      {
        id: 'iss-3',
        title: 'Low Contrast Gray-on-Slate Subtitles',
        severity: 'medium',
        description: 'Subtitle contrast ratio is 3.1:1, failing WCAG AA minimum requirement of 4.5:1 for standard body text.',
        category: 'uiUx'
      },
      {
        id: 'iss-4',
        title: 'Missing Project Outcomes and Metrics',
        severity: 'medium',
        description: 'Case studies list technologies used but do not communicate user impact, performance gains, or problem statements.',
        category: 'content'
      }
    ],
    suggestions: [
      {
        id: 'sug-1',
        title: 'Convert Hero Asset to WebP/AVIF with Srcset',
        description: 'Reduce asset size from 3.8MB down to <120KB using modern next-gen formats and responsive srcset scaling.',
        impact: 'high'
      },
      {
        id: 'sug-2',
        title: 'Add Meaningful Alt Descriptions to Project Cards',
        description: 'Describe the project dashboard UI shown in each thumbnail to achieve WCAG 2.1 Level AA compliance.',
        impact: 'high'
      },
      {
        id: 'sug-3',
        title: 'Restructure Project Case Studies with STAR Method',
        description: 'Highlight the Situation, Task, Action, and quantifiable Result for each highlighted portfolio entry.',
        impact: 'medium'
      },
      {
        id: 'sug-4',
        title: 'Implement Interactive Code or Live Sandbox Embed',
        description: 'Embed an interactive snippet or preview widget to showcase real frontend engineering mastery immediately.',
        impact: 'low'
      }
    ],
    technicalSignals: {
      title: 'Alex Chen — Full Stack Engineer & Open Source Contributor',
      hasMetaDescription: true,
      h1Count: 1,
      headingsCount: 14,
      totalImages: 9,
      imagesMissingAlt: 6,
      totalLinks: 28,
      hasNavigation: true,
      hasContactOrSocial: true,
      hasViewportMeta: true,
      loadTimeEstimateMs: 1420,
      detectedTechnologies: ['React', 'Tailwind CSS', 'Vercel', 'TypeScript']
    },
    createdAt: '2026-09-14T15:20:00Z'
  },
  {
    id: 'rev-sarahkim-design',
    url: 'https://sarahkim.design',
    domain: 'sarahkim.design',
    overallScore: 8.6,
    scores: {
      uiUx: 9.4,
      performance: 8.2,
      accessibility: 7.9,
      content: 8.8,
    },
    summary: 'Exceptional visual polish and storytelling with deliberate layout decisions, supported by responsive animations and clear contact affordances.',
    roast: 'You spent 40 hours perfecting subtle cubic-bezier easing curves, but forgot that recruiters spend an average of 4.2 seconds deciding whether you know what an API is.',
    strengths: [
      'Superb typographic contrast and purposeful whitespace pacing',
      'Interactive prototype demonstrations with video screen recordings',
      'Clear value proposition and target role specification in H1',
      'Accessible focus rings and keyboard-traversable navigation'
    ],
    issues: [
      {
        id: 'iss-5',
        title: 'Heavy Video Autoplay on Mobile Devices',
        severity: 'medium',
        description: 'Background MP4 loops run automatically on low-power mobile connections without a data-saver check.',
        category: 'performance'
      },
      {
        id: 'iss-6',
        title: 'Ambiguous Navigation Labels ("Spaces", "Vibes")',
        severity: 'low',
        description: 'Non-standard terminology forces first-time visitors to guess where case studies vs. resume downloads live.',
        category: 'uiUx'
      }
    ],
    suggestions: [
      {
        id: 'sug-5',
        title: 'Add a 1-Click PDF Resume Download in Header',
        description: 'Recruiters and hiring managers need immediate access to an ATS-friendly resume file without digging.',
        impact: 'high'
      },
      {
        id: 'sug-6',
        title: 'Respect prefers-reduced-motion Media Query',
        description: 'Wrap your parallax effects and floating cards in motion safety checks for users with vestibular sensitivities.',
        impact: 'medium'
      }
    ],
    technicalSignals: {
      title: 'Sarah Kim | Senior Product & Interface Designer',
      hasMetaDescription: true,
      h1Count: 1,
      headingsCount: 18,
      totalImages: 16,
      imagesMissingAlt: 2,
      totalLinks: 34,
      hasNavigation: true,
      hasContactOrSocial: true,
      hasViewportMeta: true,
      loadTimeEstimateMs: 980,
      detectedTechnologies: ['Next.js', 'Framer Motion', 'Cloudflare Pages']
    },
    createdAt: '2026-09-15T09:12:00Z'
  },
  {
    id: 'rev-johndoe-portfolio',
    url: 'https://johndoe-portfolio.vercel.app',
    domain: 'johndoe-portfolio.vercel.app',
    overallScore: 5.9,
    scores: {
      uiUx: 5.8,
      performance: 6.4,
      accessibility: 5.2,
      content: 6.2,
    },
    summary: 'A standard starter template with placeholder projects, missing social icons, and identical skill progress bars that say 85% for everything.',
    roast: 'You have a progress bar that claims you are "90% proficient in JavaScript" but your mobile menu doesn\'t close when clicked. The only thing more generic than your "About Me" section is a default Loren Ipsum generator.',
    strengths: [
      'Clean single-page anchor scroll layout',
      'Includes working email mailto link and GitHub link',
      'Fast baseline server response time on Vercel CDN'
    ],
    issues: [
      {
        id: 'iss-7',
        title: 'Arbitrary Skill Percentage Bars',
        severity: 'high',
        description: 'Progress meters stating "85% React" or "75% CSS" provide zero signal to technical interviewers and invite skepticism.',
        category: 'content'
      },
      {
        id: 'iss-8',
        title: 'No Viewport Meta Tag / Overflow Issues on Mobile',
        severity: 'high',
        description: 'Horizontal scrollbars appear on screens narrower than 400px due to fixed-width project cards.',
        category: 'uiUx'
      },
      {
        id: 'iss-9',
        title: 'Missing Meta Description and OpenGraph Tags',
        severity: 'medium',
        description: 'Sharing your portfolio on LinkedIn or Twitter generates a blank gray box with no thumbnail or preview snippet.',
        category: 'content'
      }
    ],
    suggestions: [
      {
        id: 'sug-7',
        title: 'Replace Percentage Meters with Concrete Projects',
        description: 'Drop the percentage gauges. Group skills by category and link them directly to GitHub repositories solving real problems.',
        impact: 'high'
      },
      {
        id: 'sug-8',
        title: 'Add Viewport Meta Tag and Flex/Grid Wrapping',
        description: 'Ensure `<meta name="viewport" content="width=device-width, initial-scale=1.0">` is set and replace static pixel widths with responsive Tailwind classes.',
        impact: 'high'
      },
      {
        id: 'sug-9',
        title: 'Buy a Custom Domain Name',
        description: 'Replacing .vercel.app with a personal .dev or .me domain costs $12/year and demonstrates long-term commitment.',
        impact: 'medium'
      }
    ],
    technicalSignals: {
      title: 'My Portfolio',
      hasMetaDescription: false,
      h1Count: 3,
      headingsCount: 8,
      totalImages: 5,
      imagesMissingAlt: 5,
      totalLinks: 12,
      hasNavigation: false,
      hasContactOrSocial: true,
      hasViewportMeta: false,
      loadTimeEstimateMs: 1850,
      detectedTechnologies: ['HTML5', 'CSS3', 'Vercel']
    },
    createdAt: '2026-09-15T18:45:00Z'
  }
];

export const LOADING_STAGES: { key: string; label: string; detail: string }[] = [
  {
    key: 'validating',
    label: 'Validating Target URL',
    detail: 'Checking protocol syntax, SSRF security guards, and domain reachability...'
  },
  {
    key: 'inspecting',
    label: 'Inspecting Portfolio DOM',
    detail: 'Fetching public HTML and discovering headings, images, and anchors...'
  },
  {
    key: 'analyzing',
    label: 'Analyzing Website Structure',
    detail: 'Evaluating semantic tags, alt coverage, navigation hierarchy, and responsiveness...'
  },
  {
    key: 'consulting_ai',
    label: 'Consulting AI Reviewer',
    detail: 'Synthesizing observable structural facts through Gemini audit engine...'
  },
  {
    key: 'finalizing',
    label: 'Calculating Weighted Scores',
    detail: 'Applying transparent 30/25/25/20 formulation and formatting roast dashboard...'
  }
];
