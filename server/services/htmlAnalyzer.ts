import * as cheerio from 'cheerio';
import {
  WebsiteAnalysisResult,
  MetaInformation,
  HeadingsSummary,
  ParagraphsSummary,
  ImagesSummary,
  LinksSummary,
  NavigationSummary,
  ButtonsSummary,
  FormsSummary,
  PortfolioSectionsSummary,
  SocialLinksSummary,
  SemanticHtmlSummary,
  AiPromptDigest,
  ImageDetail,
  LinkDetail,
} from '../types/analyzer';

/**
 * Normalizes text content: trims extra spaces, newlines, and tabs.
 */
function cleanText(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Detects modern web frameworks and tools from HTML markup, script paths, and meta tags.
 */
function detectTechnologies($: cheerio.CheerioAPI, html: string): string[] {
  const techs = new Set<string>();

  // 1. Meta Generator
  const generator = $('meta[name="generator"]').attr('content')?.toLowerCase() || '';
  if (generator.includes('next')) techs.add('Next.js');
  if (generator.includes('astro')) techs.add('Astro');
  if (generator.includes('gatsby')) techs.add('Gatsby');
  if (generator.includes('hugo')) techs.add('Hugo');
  if (generator.includes('wordpress')) techs.add('WordPress');
  if (generator.includes('webflow')) techs.add('Webflow');
  if (generator.includes('framer')) techs.add('Framer');
  if (generator.includes('svelte')) techs.add('Svelte');
  if (generator.includes('nuxt')) techs.add('Nuxt.js');

  // 2. Script Tag Inspection
  $('script').each((_, el) => {
    const src = $(el).attr('src') || '';
    const id = $(el).attr('id') || '';
    const content = $(el).html() || '';

    if (src.includes('/_next/') || id === '__NEXT_DATA__') techs.add('Next.js');
    if (src.includes('astro') || $('html[data-astro]').length > 0) techs.add('Astro');
    if (src.includes('vue') || content.includes('__VUE__')) techs.add('Vue.js');
    if (src.includes('react') || content.includes('React') || id === 'root') techs.add('React');
    if (src.includes('vite') || $('script[type="module"][src*="main"]').length > 0) techs.add('Vite');
    if (src.includes('tailwind') || html.includes('tailwind')) techs.add('Tailwind CSS');
    if (src.includes('bootstrap')) techs.add('Bootstrap');
    if (src.includes('framer-motion')) techs.add('Framer Motion');
    if (src.includes('analytics') || src.includes('googletagmanager')) techs.add('Google Analytics');
  });

  // 3. Class patterns & DOM attributes
  if ($('[class*="flex"], [class*="grid"], [class*="text-"], [class*="bg-"]').length > 8) {
    techs.add('Tailwind CSS');
  }
  if ($('#__next').length > 0) techs.add('Next.js');
  if ($('#root, #app').length > 0 && !techs.has('Next.js') && !techs.has('Astro')) {
    techs.add('Single Page App (React/Vue)');
  }
  if (html.includes('vercel')) techs.add('Vercel');
  if (html.includes('netlify')) techs.add('Netlify');
  if (html.includes('github.io')) techs.add('GitHub Pages');
  if (html.includes('cloudflare')) techs.add('Cloudflare');

  if (techs.size === 0) {
    techs.add('HTML5');
    techs.add('Modern CSS');
  }

  return Array.from(techs);
}

/**
 * Analyzes parsed HTML and extracts structured developer signals.
 */
export function analyzeHtml(
  html: string,
  url: string,
  finalUrl: string,
  domain: string,
  httpStatus: number,
  contentType: string,
  responseTimeMs: number,
  htmlSizeBytes: number
): WebsiteAnalysisResult {
  const $ = cheerio.load(html);

  // 1. Meta & Document Information
  const pageTitle =
    cleanText($('title').first().text()) ||
    cleanText($('meta[property="og:title"]').attr('content')) ||
    cleanText($('h1').first().text()) ||
    domain;

  const metaDesc =
    cleanText($('meta[name="description"]').attr('content')) ||
    cleanText($('meta[property="og:description"]').attr('content')) ||
    null;

  const viewport = $('meta[name="viewport"]').attr('content') || null;
  const hasViewportMeta = Boolean(viewport && viewport.includes('width=device-width'));

  const meta: MetaInformation = {
    title: pageTitle,
    metaDescription: metaDesc,
    viewport,
    hasViewportMeta,
    charset: $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || 'utf-8',
    author: $('meta[name="author"]').attr('content') || null,
    canonicalUrl: $('link[rel="canonical"]').attr('href') || null,
    ogTitle: $('meta[property="og:title"]').attr('content') || null,
    ogDescription: $('meta[property="og:description"]').attr('content') || null,
    ogImage: $('meta[property="og:image"]').attr('content') || null,
    twitterCard: $('meta[name="twitter:card"]').attr('content') || null,
  };

  // 2. Headings Analysis
  const h1: string[] = [];
  $('h1').each((_, el) => {
    const text = cleanText($(el).text());
    if (text) h1.push(text);
  });

  const h2: string[] = [];
  $('h2').each((_, el) => {
    const text = cleanText($(el).text());
    if (text) h2.push(text);
  });

  const h3: string[] = [];
  $('h3').each((_, el) => {
    const text = cleanText($(el).text());
    if (text) h3.push(text);
  });

  const h4ToH6Count = $('h4, h5, h6').length;
  const headings: HeadingsSummary = {
    h1,
    h2,
    h3,
    h4ToH6Count,
    totalCount: h1.length + h2.length + h3.length + h4ToH6Count,
  };

  // 3. Paragraphs Analysis
  const paragraphTexts: string[] = [];
  let totalWordCount = 0;
  let totalCharLength = 0;

  $('p').each((_, el) => {
    const text = cleanText($(el).text());
    if (text && text.length > 15) {
      if (paragraphTexts.length < 8) {
        paragraphTexts.push(text.length > 240 ? text.substring(0, 237) + '...' : text);
      }
      totalWordCount += text.split(/\s+/).length;
      totalCharLength += text.length;
    }
  });

  const paragraphs: ParagraphsSummary = {
    count: $('p').length,
    sampleTexts: paragraphTexts,
    totalWordCount,
    totalCharLength,
  };

  // 4. Images Analysis
  const sampleImages: ImageDetail[] = [];
  const missingAltSources: string[] = [];
  let totalImages = 0;
  let missingAltCount = 0;

  $('img, picture img, svg').each((_, el) => {
    const tagName = el.tagName.toLowerCase();
    if (tagName === 'img') {
      totalImages++;
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      const alt = $(el).attr('alt');
      const hasAlt = typeof alt === 'string' && alt.trim().length > 0;

      if (!hasAlt) {
        missingAltCount++;
        if (missingAltSources.length < 6 && src) {
          missingAltSources.push(src.substring(0, 90));
        }
      }

      if (sampleImages.length < 8 && src) {
        sampleImages.push({
          src: src.substring(0, 120),
          alt: alt || null,
          hasAlt,
          loading: $(el).attr('loading') || null,
          width: $(el).attr('width') || null,
          height: $(el).attr('height') || null,
        });
      }
    }
  });

  const images: ImagesSummary = {
    total: totalImages,
    missingAltCount,
    missingAltSources,
    sampleImages,
  };

  // 5. Links Analysis
  let internalLinksCount = 0;
  let externalLinksCount = 0;
  const sampleLinks: LinkDetail[] = [];

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = cleanText($(el).text()) || $(el).attr('aria-label') || $(el).attr('title') || 'Link';
    const isExternal = /^https?:\/\//i.test(href) && !href.includes(domain);

    if (isExternal) {
      externalLinksCount++;
    } else {
      internalLinksCount++;
    }

    const rel = $(el).attr('rel') || '';
    const hasRelNoopener = rel.includes('noopener') || rel.includes('noreferrer');

    if (sampleLinks.length < 10 && href && href !== '#') {
      sampleLinks.push({
        text: text.substring(0, 45),
        href: href.substring(0, 100),
        isExternal,
        hasRelNoopener,
      });
    }
  });

  const links: LinksSummary = {
    total: internalLinksCount + externalLinksCount,
    internalCount: internalLinksCount,
    externalCount: externalLinksCount,
    sampleLinks,
  };

  // 6. Navigation Analysis
  const navItems: string[] = [];
  $('nav a, header a, [role="navigation"] a').each((_, el) => {
    const text = cleanText($(el).text());
    if (text && text.length < 30 && !navItems.includes(text)) {
      navItems.push(text);
    }
  });

  const navigation: NavigationSummary = {
    hasNavigation: $('nav, [role="navigation"], header nav').length > 0 || navItems.length >= 2,
    navItems: navItems.slice(0, 8),
    navCount: navItems.length,
  };

  // 7. Buttons Analysis
  const sampleButtons: string[] = [];
  $('button, [role="button"], a.btn, a.button, input[type="submit"], input[type="button"]').each((_, el) => {
    const text = cleanText($(el).text()) || $(el).attr('value') || $(el).attr('aria-label') || '';
    if (text && text.length < 40 && !sampleButtons.includes(text)) {
      sampleButtons.push(text);
    }
  });

  const buttons: ButtonsSummary = {
    count: $('button, [role="button"], input[type="submit"]').length,
    sampleLabels: sampleButtons.slice(0, 8),
  };

  // 8. Forms Analysis
  const formDetails: FormsSummary['formDetails'] = [];
  let hasContactForm = false;
  let hasEmailInput = false;

  $('form').each((_, formEl) => {
    const inputTypes: string[] = [];
    $(formEl)
      .find('input, textarea, select')
      .each((_, inputEl) => {
        const type = $(inputEl).attr('type') || inputEl.tagName.toLowerCase();
        inputTypes.push(type);
        if (type === 'email') hasEmailInput = true;
      });

    const formId = $(formEl).attr('id') || $(formEl).attr('name') || '';
    const action = $(formEl).attr('action') || '';
    const method = ($(formEl).attr('method') || 'get').toUpperCase();

    if (formId.toLowerCase().includes('contact') || action.includes('formspree') || hasEmailInput) {
      hasContactForm = true;
    }

    formDetails.push({
      id: formId || undefined,
      action: action || undefined,
      method,
      inputTypes,
    });
  });

  const forms: FormsSummary = {
    count: $('form').length,
    hasContactForm: hasContactForm || $('input[type="email"]').length > 0,
    hasEmailInput,
    hasSubmitButton: $('form input[type="submit"], form button[type="submit"], form button').length > 0,
    formDetails,
  };

  // 9. Portfolio Specific Sections & Projects
  const detectedProjectTitles: string[] = [];
  const detectedTechTags = new Set<string>();

  const projectContainers = $(
    '[id*="project"], [class*="project"], [id*="portfolio"], [class*="portfolio"], [id*="work"], [class*="work"], [id*="case-stud"]'
  );
  const hasProjectsSection = projectContainers.length > 0;

  // Extract titles inside project containers
  projectContainers.find('h2, h3, h4, [class*="title"], [class*="name"]').each((_, el) => {
    const title = cleanText($(el).text());
    if (
      title &&
      title.length > 3 &&
      title.length < 50 &&
      !detectedProjectTitles.includes(title) &&
      !['projects', 'featured projects', 'my work', 'portfolio', 'recent work'].includes(title.toLowerCase())
    ) {
      detectedProjectTitles.push(title);
    }
  });

  // Extract skill/tech badges
  $('[class*="tag"], [class*="badge"], [class*="skill"], [class*="pill"]').each((_, el) => {
    const tag = cleanText($(el).text());
    if (tag && tag.length >= 2 && tag.length <= 20) {
      detectedTechTags.add(tag);
    }
  });

  const fullText = cleanText($('body').text()).toLowerCase();
  const hasAboutSection =
    $('[id*="about"], [class*="about"]').length > 0 || fullText.includes('about me') || fullText.includes('who i am');
  const hasContactSection =
    $('[id*="contact"], [class*="contact"]').length > 0 || fullText.includes('get in touch') || fullText.includes('contact me');
  const hasSkillsSection =
    $('[id*="skill"], [class*="skill"], [id*="tech"], [class*="stack"]').length > 0 || fullText.includes('skills');
  const hasExperienceSection =
    $('[id*="experience"], [class*="experience"], [id*="timeline"], [class*="career"]').length > 0 ||
    fullText.includes('experience') ||
    fullText.includes('work history');

  const portfolioSections: PortfolioSectionsSummary = {
    hasProjectsSection,
    detectedProjectTitles: detectedProjectTitles.slice(0, 10),
    detectedTechTags: Array.from(detectedTechTags).slice(0, 15),
    hasAboutSection,
    hasContactSection,
    hasSkillsSection,
    hasExperienceSection,
  };

  // 10. Social Links
  const socialLinks: SocialLinksSummary = {
    other: [],
  };

  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').toLowerCase();
    if (href.startsWith('mailto:')) {
      socialLinks.email = href.replace('mailto:', '');
    } else if (href.includes('github.com')) {
      socialLinks.github = $(el).attr('href');
    } else if (href.includes('linkedin.com')) {
      socialLinks.linkedin = $(el).attr('href');
    } else if (href.includes('twitter.com') || href.includes('x.com')) {
      socialLinks.twitterOrX = $(el).attr('href');
    } else if (href.includes('youtube.com')) {
      socialLinks.youtube = $(el).attr('href');
    } else if (href.includes('dribbble.com')) {
      socialLinks.dribbble = $(el).attr('href');
    } else if (href.includes('behance.net')) {
      socialLinks.behance = $(el).attr('href');
    } else if (href.includes('instagram.com')) {
      socialLinks.instagram = $(el).attr('href');
    }
  });

  // 11. Semantic HTML Landmarks
  const hasHeader = $('header').length > 0;
  const hasNav = $('nav').length > 0;
  const hasMain = $('main').length > 0;
  const hasFooter = $('footer').length > 0;
  const hasArticle = $('article').length > 0;
  const sectionCount = $('section').length;
  const articleCount = $('article').length;
  const asideCount = $('aside').length;

  let semanticScore = 0;
  if (hasMain) semanticScore += 30;
  if (hasNav) semanticScore += 20;
  if (hasHeader) semanticScore += 15;
  if (hasFooter) semanticScore += 15;
  if (sectionCount >= 2) semanticScore += 10;
  if (h1.length === 1) semanticScore += 10; // Clean single H1 landmark

  const semanticSignals: SemanticHtmlSummary = {
    hasHeader,
    hasNav,
    hasMain,
    hasFooter,
    hasArticle,
    sectionCount,
    articleCount,
    asideCount,
    semanticScore: Math.min(100, semanticScore),
  };

  // 12. Detected Technologies
  const detectedTechnologies = detectTechnologies($, html);

  // 13. High-signal AI Prompt Digest (Prepared for Gemini integration in Phase 4)
  const keyObservations: string[] = [];
  if (h1.length === 0) keyObservations.push('Missing top-level <h1> heading on the page.');
  if (h1.length > 1) keyObservations.push(`Multiple (${h1.length}) <h1> headings detected instead of a single page topic.`);
  if (!metaDesc) keyObservations.push('Missing meta description tag for search engine indexing.');
  if (images.missingAltCount > 0) {
    keyObservations.push(
      `${images.missingAltCount} out of ${images.total} images are missing alternative descriptive (alt) text.`
    );
  }
  if (!hasMain) keyObservations.push('Markup does not use the HTML5 <main> semantic landmark.');
  if (portfolioSections.detectedProjectTitles.length > 0) {
    keyObservations.push(
      `Identified ${portfolioSections.detectedProjectTitles.length} showcased projects: ${portfolioSections.detectedProjectTitles.slice(0, 4).join(', ')}.`
    );
  }
  if (socialLinks.github || socialLinks.linkedin) {
    keyObservations.push('Developer presence verified with outbound GitHub / LinkedIn profiles.');
  }

  const aiDigest: AiPromptDigest = {
    siteIdentity: {
      title: pageTitle,
      description: metaDesc || 'No meta description provided.',
      domain,
      detectedTech: detectedTechnologies,
    },
    structureAndSemantics: {
      hasMainLandmark: hasMain,
      hasProperNav: navigation.hasNavigation,
      h1Summary: h1.join(' | ') || 'None found',
      headingsHierarchyClean: h1.length === 1 && h2.length > 0,
    },
    contentAndStorytelling: {
      totalParagraphs: paragraphs.count,
      sampleContentSnippets: paragraphTexts.slice(0, 4),
      detectedProjects: portfolioSections.detectedProjectTitles,
      hasAboutStory: portfolioSections.hasAboutSection,
      hasClearContactPath: Boolean(portfolioSections.hasContactSection || socialLinks.email || forms.hasContactForm),
    },
    accessibilityAndPerformanceFlags: {
      totalImages: images.total,
      imagesMissingAlt: images.missingAltCount,
      hasViewportConfigured: hasViewportMeta,
      brokenOrEmptyLinksDetected: $('a[href="#"], a[href=""]').length,
    },
    keyObservations,
  };

  return {
    url,
    finalUrl,
    domain,
    fetchedAt: new Date().toISOString(),
    httpStatus,
    contentType,
    responseTimeMs,
    htmlSizeBytes,
    meta,
    headings,
    paragraphs,
    images,
    links,
    navigation,
    buttons,
    forms,
    portfolioSections,
    socialLinks,
    semanticSignals,
    detectedTechnologies,
    aiDigest,
  };
}
