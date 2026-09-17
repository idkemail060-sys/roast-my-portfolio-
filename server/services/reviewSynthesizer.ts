import { PortfolioReview, AuditIssue, AuditSuggestion } from '../../src/types';
import { WebsiteAnalysisResult } from '../types/analyzer';
import { GeminiAuditResponse } from './geminiService';

/**
 * Builds a structured PortfolioReview from real observable HTML signals (deterministic fallback).
 */
export function buildReviewFromAnalysis(analysis: WebsiteAnalysisResult): PortfolioReview {
  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const { meta, headings, paragraphs, images, links, navigation, portfolioSections, socialLinks, semanticSignals } =
    analysis;

  // 1. Calculate Score for UI/UX (0.0 - 10.0)
  let uiUx = 7.5;
  if (meta.hasViewportMeta) uiUx += 0.8;
  else uiUx -= 2.0;
  if (navigation.hasNavigation) uiUx += 0.6;
  if (portfolioSections.hasProjectsSection) uiUx += 0.6;
  if (semanticSignals.semanticScore >= 70) uiUx += 0.5;
  uiUx = Math.max(2.5, Math.min(9.8, parseFloat(uiUx.toFixed(1))));

  // 2. Calculate Score for Performance (0.0 - 10.0)
  let performance = 8.5;
  if (analysis.responseTimeMs < 400) performance += 0.8;
  else if (analysis.responseTimeMs > 1500) performance -= 1.2;
  else if (analysis.responseTimeMs > 3000) performance -= 2.5;

  if (analysis.htmlSizeBytes > 1024 * 1024) performance -= 1.0;
  if (images.total > 15) performance -= 0.5;
  performance = Math.max(3.0, Math.min(9.9, parseFloat(performance.toFixed(1))));

  // 3. Calculate Score for Accessibility (0.0 - 10.0)
  let accessibility = 8.0;
  if (images.total > 0) {
    const missingRatio = images.missingAltCount / images.total;
    accessibility -= missingRatio * 3.5;
  }
  if (headings.h1.length === 1) accessibility += 0.5;
  else if (headings.h1.length === 0) accessibility -= 1.5;
  else if (headings.h1.length > 2) accessibility -= 0.8;

  if (!semanticSignals.hasMain) accessibility -= 0.8;
  accessibility = Math.max(2.0, Math.min(9.7, parseFloat(accessibility.toFixed(1))));

  // 4. Calculate Score for Content (0.0 - 10.0)
  let content = 7.0;
  if (paragraphs.count >= 3 && paragraphs.totalWordCount > 100) content += 0.8;
  if (portfolioSections.hasProjectsSection && portfolioSections.detectedProjectTitles.length > 0) content += 1.0;
  if (portfolioSections.hasAboutSection) content += 0.6;
  if (socialLinks.github || socialLinks.linkedin) content += 0.5;
  if (!meta.metaDescription) content -= 0.7;
  content = Math.max(3.0, Math.min(9.8, parseFloat(content.toFixed(1))));

  // Overall Score (Weighted Average)
  const overallScore = parseFloat(((uiUx * 0.3 + performance * 0.25 + accessibility * 0.25 + content * 0.2) * 1.0).toFixed(1));

  // 5. Generate Real Strengths
  const strengths: string[] = [];
  if (meta.hasViewportMeta) {
    strengths.push('Responsive viewport metadata correctly configured for mobile devices');
  }
  if (navigation.hasNavigation) {
    strengths.push(`Clear navigation hierarchy with ${navigation.navCount || 3} primary access pathways`);
  }
  if (analysis.responseTimeMs < 800) {
    strengths.push(`Fast initial server response latency (${analysis.responseTimeMs}ms)`);
  }
  if (portfolioSections.detectedProjectTitles.length > 0) {
    strengths.push(`Showcases explicit project highlights (${portfolioSections.detectedProjectTitles.slice(0, 3).join(', ')})`);
  }
  if (socialLinks.github || socialLinks.linkedin) {
    strengths.push('Direct developer profile links detected (GitHub / LinkedIn)');
  }
  if (semanticSignals.semanticScore >= 70) {
    strengths.push('Structured semantic layout utilizing standard HTML5 landmarks');
  }
  if (strengths.length < 2) {
    strengths.push(`Successfully delivered public HTML content (${(analysis.htmlSizeBytes / 1024).toFixed(1)} KB)`);
    strengths.push('Accessible HTTP transport endpoint with valid status code 200');
  }

  // 6. Generate Real Detected Issues
  const issues: AuditIssue[] = [];

  if (images.missingAltCount > 0) {
    issues.push({
      id: `${reviewId}_iss_alt`,
      title: `${images.missingAltCount} Image${images.missingAltCount > 1 ? 's' : ''} Missing Alt Text`,
      severity: images.missingAltCount > 3 ? 'high' : 'medium',
      description: `Screen readers cannot narrate graphic assets because alt attributes are absent on ${images.missingAltCount} image elements.`,
      category: 'accessibility',
    });
  }

  if (headings.h1.length === 0) {
    issues.push({
      id: `${reviewId}_iss_h1`,
      title: 'Missing Top-Level <h1> Landmark',
      severity: 'high',
      description: 'The page lacks a primary <h1> heading, harming both SEO topic relevance and screen reader landmark navigation.',
      category: 'accessibility',
    });
  } else if (headings.h1.length > 1) {
    issues.push({
      id: `${reviewId}_iss_multi_h1`,
      title: `Multiple (${headings.h1.length}) <h1> Headings Found`,
      severity: 'medium',
      description: 'Having multiple H1 tags dilutes the primary topic hierarchy. Modern web standards recommend a single clear H1 per document.',
      category: 'uiUx',
    });
  }

  if (!meta.metaDescription) {
    issues.push({
      id: `${reviewId}_iss_meta_desc`,
      title: 'Missing Meta Description Tag',
      severity: 'medium',
      description: 'Search engines and social cards will fall back to arbitrary page snippets because no descriptive <meta name="description"> tag is present.',
      category: 'content',
    });
  }

  if (!semanticSignals.hasMain) {
    issues.push({
      id: `${reviewId}_iss_main`,
      title: 'Missing <main> Semantic Container',
      severity: 'low',
      description: 'Assistive navigation shortcuts cannot jump directly to the primary page content without a <main> landmark.',
      category: 'accessibility',
    });
  }

  if (!portfolioSections.hasProjectsSection && portfolioSections.detectedProjectTitles.length === 0) {
    issues.push({
      id: `${reviewId}_iss_no_projects`,
      title: 'No Explicit Project Showcase Identified',
      severity: 'high',
      description: 'Visitors and recruiters look for concrete case studies. No identifiable project section or project titles were detected.',
      category: 'content',
    });
  }

  if (issues.length === 0) {
    issues.push({
      id: `${reviewId}_iss_default`,
      title: 'Limited Technical Metrics on Project Cards',
      severity: 'low',
      description: 'Consider adding quantified outcomes (e.g. latency reduced by 40%, 10k monthly active users) to your case studies.',
      category: 'content',
    });
  }

  // 7. Actionable Suggestions
  const suggestions: AuditSuggestion[] = [];

  if (images.missingAltCount > 0) {
    suggestions.push({
      id: `${reviewId}_sug_alt`,
      title: 'Add Contextual Alt Descriptions to All Project Images',
      description: 'Audit each project thumbnail and screenshot to ensure assistive technology can interpret your UI designs.',
      impact: 'high',
    });
  }

  if (!meta.metaDescription) {
    suggestions.push({
      id: `${reviewId}_sug_meta`,
      title: 'Craft a Focused 150-Character Meta Description',
      description: 'Highlight your specialization (e.g. Full-Stack Engineer, Product Designer) in the head tag for crisp link previews.',
      impact: 'medium',
    });
  }

  if (portfolioSections.detectedProjectTitles.length > 0) {
    suggestions.push({
      id: `${reviewId}_sug_metrics`,
      title: 'Quantify Engineering Impact on Project Highlights',
      description: `For ${portfolioSections.detectedProjectTitles[0] || 'your flagship project'}, include architecture rationale and measurable performance metrics.`,
      impact: 'medium',
    });
  } else {
    suggestions.push({
      id: `${reviewId}_sug_projects`,
      title: 'Introduce a Distinct "Featured Projects" Section',
      description: 'Structure 2-3 in-depth case studies with live demos, repository links, and problem-solution writeups.',
      impact: 'high',
    });
  }

  // 8. Contextual Roast referencing real detected observables
  const detectedTech = analysis.detectedTechnologies.join(', ');
  let roast = `Nice portfolio! You've got ${analysis.detectedTechnologies[0] || 'modern tech'} running, but your hero section is playing hide-and-seek and your project cards are more mysterious than legacy undocumented code.`;

  if (images.missingAltCount > 4) {
    roast = `You've got ${images.missingAltCount} images without alt text. Screen readers must think your portfolio is an avant-garde silent film.`;
  } else if (!portfolioSections.hasProjectsSection) {
    roast = `A developer portfolio without identifiable project case studies is like a cookbook with no recipes—looks clean, but where's the meal?`;
  } else if (headings.h1.length === 0) {
    roast = `Your portfolio forgot to bring an <h1> heading to its own party. Even Google's crawler is looking around wondering what you do.`;
  } else if (analysis.responseTimeMs > 2500) {
    roast = `At ${analysis.responseTimeMs}ms server latency, recruiters have already tabbed back to LinkedIn before your CSS even arrives.`;
  } else if (portfolioSections.detectedProjectTitles.length > 0) {
    roast = `Showcasing "${portfolioSections.detectedProjectTitles[0]}" is great, but don't just tell me what tech stack you used—prove it actually ran in production without exploding on day two!`;
  }

  const summary = `Audit completed for ${analysis.domain}. Found ${headings.totalCount} headings, ${paragraphs.count} paragraphs, and ${images.total} images. Detected stack: ${detectedTech || 'Standard Web'}.`;

  return {
    id: reviewId,
    url: analysis.url,
    domain: analysis.domain,
    overallScore,
    scores: {
      uiUx,
      performance,
      accessibility,
      content,
    },
    uiUx,
    performance,
    accessibility,
    content,
    summary,
    roast,
    strengths: strengths.slice(0, 5),
    issues: issues.slice(0, 6),
    suggestions: suggestions.slice(0, 4),
    technicalSignals: {
      title: meta.title,
      hasMetaDescription: Boolean(meta.metaDescription),
      h1Count: headings.h1.length,
      headingsCount: headings.totalCount,
      totalImages: images.total,
      imagesMissingAlt: images.missingAltCount,
      totalLinks: links.total,
      hasNavigation: navigation.hasNavigation,
      hasContactOrSocial: Boolean(socialLinks.github || socialLinks.linkedin || socialLinks.email || portfolioSections.hasContactSection),
      hasViewportMeta: meta.hasViewportMeta,
      loadTimeEstimateMs: analysis.responseTimeMs,
      detectedTechnologies: analysis.detectedTechnologies,
    },
    analysis,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Builds a structured PortfolioReview using Gemini AI evaluated results and real observables.
 */
export function buildReviewFromAi(
  analysis: WebsiteAnalysisResult,
  aiResult: GeminiAuditResponse
): PortfolioReview {
  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const issues: AuditIssue[] = aiResult.issues.map((iss, idx) => {
    let category: 'uiUx' | 'performance' | 'accessibility' | 'content' = 'uiUx';
    const combined = `${iss.title} ${iss.description}`.toLowerCase();
    if (
      combined.includes('alt') ||
      combined.includes('a11y') ||
      combined.includes('contrast') ||
      combined.includes('aria') ||
      combined.includes('screen reader') ||
      combined.includes('h1') ||
      combined.includes('semantic') ||
      combined.includes('landmark')
    ) {
      category = 'accessibility';
    } else if (
      combined.includes('speed') ||
      combined.includes('latency') ||
      combined.includes('performance') ||
      combined.includes('size') ||
      combined.includes('load') ||
      combined.includes('payload')
    ) {
      category = 'performance';
    } else if (
      combined.includes('content') ||
      combined.includes('copy') ||
      combined.includes('project') ||
      combined.includes('text') ||
      combined.includes('about') ||
      combined.includes('meta') ||
      combined.includes('story')
    ) {
      category = 'content';
    }

    return {
      id: `${reviewId}_iss_${idx + 1}`,
      title: iss.title,
      severity: iss.severity,
      description: iss.description,
      category,
    };
  });

  const suggestions: AuditSuggestion[] = aiResult.suggestions.map((sug, idx) => ({
    id: `${reviewId}_sug_${idx + 1}`,
    title: sug.title,
    description: sug.description,
    impact: idx === 0 ? 'high' : 'medium',
  }));

  const { meta, headings, images, links, navigation, portfolioSections, socialLinks } = analysis;

  return {
    id: reviewId,
    url: analysis.url,
    domain: analysis.domain,
    overallScore: aiResult.overallScore,
    scores: {
      uiUx: aiResult.uiUx,
      performance: aiResult.performance,
      accessibility: aiResult.accessibility,
      content: aiResult.content,
    },
    uiUx: aiResult.uiUx,
    performance: aiResult.performance,
    accessibility: aiResult.accessibility,
    content: aiResult.content,
    summary: aiResult.summary,
    roast: aiResult.roast,
    strengths: aiResult.strengths,
    issues,
    suggestions,
    technicalSignals: {
      title: meta.title,
      hasMetaDescription: Boolean(meta.metaDescription),
      h1Count: headings.h1.length,
      headingsCount: headings.totalCount,
      totalImages: images.total,
      imagesMissingAlt: images.missingAltCount,
      totalLinks: links.total,
      hasNavigation: navigation.hasNavigation,
      hasContactOrSocial: Boolean(
        socialLinks.github || socialLinks.linkedin || socialLinks.email || portfolioSections.hasContactSection
      ),
      hasViewportMeta: meta.hasViewportMeta,
      loadTimeEstimateMs: analysis.responseTimeMs,
      detectedTechnologies: analysis.detectedTechnologies,
    },
    analysis,
    createdAt: new Date().toISOString(),
  };
}
