/**
 * Structured TypeScript interfaces for Website Fetching & HTML Analysis (Phase 3).
 */

export interface ImageDetail {
  src: string;
  alt: string | null;
  hasAlt: boolean;
  loading?: string | null;
  width?: string | null;
  height?: string | null;
}

export interface LinkDetail {
  text: string;
  href: string;
  isExternal: boolean;
  hasRelNoopener: boolean;
}

export interface SocialLinksSummary {
  github?: string;
  linkedin?: string;
  twitterOrX?: string;
  youtube?: string;
  dribbble?: string;
  behance?: string;
  instagram?: string;
  email?: string;
  other: string[];
}

export interface HeadingsSummary {
  h1: string[];
  h2: string[];
  h3: string[];
  h4ToH6Count: number;
  totalCount: number;
}

export interface ParagraphsSummary {
  count: number;
  sampleTexts: string[];
  totalWordCount: number;
  totalCharLength: number;
}

export interface ImagesSummary {
  total: number;
  missingAltCount: number;
  missingAltSources: string[];
  sampleImages: ImageDetail[];
}

export interface LinksSummary {
  total: number;
  internalCount: number;
  externalCount: number;
  sampleLinks: LinkDetail[];
}

export interface NavigationSummary {
  hasNavigation: boolean;
  navItems: string[];
  navCount: number;
}

export interface ButtonsSummary {
  count: number;
  sampleLabels: string[];
}

export interface FormsSummary {
  count: number;
  hasContactForm: boolean;
  hasEmailInput: boolean;
  hasSubmitButton: boolean;
  formDetails: Array<{
    id?: string;
    action?: string;
    method?: string;
    inputTypes: string[];
  }>;
}

export interface PortfolioSectionsSummary {
  hasProjectsSection: boolean;
  detectedProjectTitles: string[];
  detectedTechTags: string[];
  hasAboutSection: boolean;
  hasContactSection: boolean;
  hasSkillsSection: boolean;
  hasExperienceSection: boolean;
}

export interface SemanticHtmlSummary {
  hasHeader: boolean;
  hasNav: boolean;
  hasMain: boolean;
  hasFooter: boolean;
  hasArticle: boolean;
  sectionCount: number;
  articleCount: number;
  asideCount: number;
  semanticScore: number; // 0 - 100 based on standard HTML5 landmarks
}

export interface MetaInformation {
  title: string;
  metaDescription: string | null;
  viewport: string | null;
  hasViewportMeta: boolean;
  charset: string | null;
  author: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
}

/**
 * Clean, summarized digest ready for Gemini prompt input in Phase 4.
 * Prevents sending raw, bloated HTML while capturing high-signal observations.
 */
export interface AiPromptDigest {
  siteIdentity: {
    title: string;
    description: string;
    domain: string;
    detectedTech: string[];
  };
  structureAndSemantics: {
    hasMainLandmark: boolean;
    hasProperNav: boolean;
    h1Summary: string;
    headingsHierarchyClean: boolean;
  };
  contentAndStorytelling: {
    totalParagraphs: number;
    sampleContentSnippets: string[];
    detectedProjects: string[];
    hasAboutStory: boolean;
    hasClearContactPath: boolean;
  };
  accessibilityAndPerformanceFlags: {
    totalImages: number;
    imagesMissingAlt: number;
    hasViewportConfigured: boolean;
    brokenOrEmptyLinksDetected: number;
  };
  keyObservations: string[];
}

/**
 * Complete structured result from the Website Analyzer.
 */
export interface WebsiteAnalysisResult {
  url: string;
  finalUrl: string;
  domain: string;
  fetchedAt: string;
  httpStatus: number;
  contentType: string;
  responseTimeMs: number;
  htmlSizeBytes: number;

  meta: MetaInformation;
  headings: HeadingsSummary;
  paragraphs: ParagraphsSummary;
  images: ImagesSummary;
  links: LinksSummary;
  navigation: NavigationSummary;
  buttons: ButtonsSummary;
  forms: FormsSummary;
  portfolioSections: PortfolioSectionsSummary;
  socialLinks: SocialLinksSummary;
  semanticSignals: SemanticHtmlSummary;
  detectedTechnologies: string[];

  // Digest specifically designed for feeding to Gemini in Phase 4
  aiDigest: AiPromptDigest;
}
