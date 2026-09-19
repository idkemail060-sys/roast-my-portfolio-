import { GoogleGenAI, Type } from '@google/genai';
import { WebsiteAnalysisResult } from '../types/analyzer';

/**
 * Expected schema structure from Gemini AI portfolio evaluation.
 */
export interface GeminiAuditResponse {
  overallScore: number;
  uiUx: number;
  performance: number;
  accessibility: number;
  content: number;
  summary: string;
  roast: string;
  strengths: string[];
  issues: Array<{
    title: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }>;
  suggestions: Array<{
    title: string;
    description: string;
  }>;
}

/**
 * Lazy-initialized GoogleGenAI client singleton.
 * Keeps keys strictly on the server side and configures telemetry headers.
 */
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Validates, normalizes, and clamps raw parsed JSON into a valid GeminiAuditResponse.
 * Returns null if critical properties cannot be salvaged.
 */
export function validateAndNormalizeAiAudit(raw: unknown): GeminiAuditResponse | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  // Helper to clamp scores between 0.0 and 10.0
  const parseScore = (val: unknown, fallback: number): number => {
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    if (isNaN(num)) return fallback;
    return Math.max(0.0, Math.min(10.0, parseFloat(num.toFixed(1))));
  };

  const uiUx = parseScore(obj.uiUx, 7.0);
  const performance = parseScore(obj.performance, 7.5);
  const accessibility = parseScore(obj.accessibility, 7.0);
  const content = parseScore(obj.content, 7.0);

  let overallScore = parseScore(obj.overallScore, 0);
  if (overallScore === 0) {
    overallScore = parseFloat(((uiUx * 0.3 + performance * 0.25 + accessibility * 0.25 + content * 0.2) * 1.0).toFixed(1));
  }

  // Summary
  const summary = typeof obj.summary === 'string' && obj.summary.trim().length > 0
    ? obj.summary.trim()
    : 'Portfolio audit completed based on observed web standards and structure.';

  // Roast
  const roast = typeof obj.roast === 'string' && obj.roast.trim().length > 0
    ? obj.roast.trim()
    : 'Portfolio analysis finished. Consider refining case study metrics and visual hierarchy!';

  // Strengths
  const strengths: string[] = [];
  if (Array.isArray(obj.strengths)) {
    for (const s of obj.strengths) {
      if (typeof s === 'string' && s.trim().length > 0) {
        strengths.push(s.trim());
      }
    }
  }
  if (strengths.length === 0) {
    strengths.push('Clean public web presence deployed with accessible HTML markup.');
  }

  // Issues
  const issues: GeminiAuditResponse['issues'] = [];
  if (Array.isArray(obj.issues)) {
    for (const item of obj.issues) {
      if (item && typeof item === 'object') {
        const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : 'Review Observation';
        let severity: 'high' | 'medium' | 'low' = 'medium';
        if (typeof item.severity === 'string') {
          const lower = item.severity.toLowerCase();
          if (lower === 'high' || lower === 'medium' || lower === 'low') {
            severity = lower;
          }
        }
        const description = typeof item.description === 'string' && item.description.trim()
          ? item.description.trim()
          : 'Further refinement recommended to align with industry portfolio best practices.';

        issues.push({ title, severity, description });
      }
    }
  }

  // Suggestions
  const suggestions: GeminiAuditResponse['suggestions'] = [];
  if (Array.isArray(obj.suggestions)) {
    for (const item of obj.suggestions) {
      if (item && typeof item === 'object') {
        const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : 'Enhance Case Studies';
        const description = typeof item.description === 'string' && item.description.trim()
          ? item.description.trim()
          : 'Incorporate quantified engineering impact, architecture decisions, and live links.';

        suggestions.push({ title, description });
      }
    }
  }

  return {
    overallScore,
    uiUx,
    performance,
    accessibility,
    content,
    summary,
    roast,
    strengths: strengths.slice(0, 5),
    issues: issues.slice(0, 6),
    suggestions: suggestions.slice(0, 4),
  };
}

/**
 * Evaluates a portfolio using Gemini 3.8 Flash given the structured DOM analysis.
 * Adheres strictly to the user requirements:
 * - Does not invent facts.
 * - Only uses information present in the supplied analysis.
 * - Distinguishes observable facts from subjective recommendations.
 * - Returns structured JSON.
 */
export async function generateGeminiPortfolioAudit(
  analysis: WebsiteAnalysisResult
): Promise<GeminiAuditResponse | null> {
  const client = getAiClient();
  if (!client) {
    console.log('[GeminiService] No GEMINI_API_KEY found in server environment, bypassing AI call.');
    return null;
  }

  const startTime = Date.now();

  const systemInstruction = `You are a world-class senior design engineer and technical recruiter who audits developer, designer, and engineer portfolios.
Your goal is to perform a rigorous, honest, and high-signal audit of the portfolio based EXCLUSIVELY on the provided structured HTML website analysis.

CRITICAL INSTRUCTIONS:
1. DO NOT invent facts or hallucinate content.
2. ONLY use the observable data, metrics, tags, and samples present in the supplied analysis object.
3. Distinguish observable facts (e.g. "missing H1 heading", "12 images lack alt attributes", "latency was 250ms") from subjective recommendations.
4. Evaluate:
   - UI/UX & Visual hierarchy
   - Performance indicators (latency, HTML payload size, image count)
   - Accessibility (image alt text, semantic HTML5 landmarks, H1-H3 hierarchy)
   - Content & copywriting (word count, case study depth, clear self-introduction)
   - Navigation & structure (presence of header nav, menu items, semantic landmarks)
   - Project presentation (showcasing tangible projects, titles, tech tags)
   - Responsiveness indicators (viewport meta tag presence and configuration)
   - Call to Action (CTA) clarity (contact paths, email, forms, social profiles)
5. Humorous Roast:
   - Write a witty, clever, concise, and constructive roast (2-3 sentences max).
   - Base the humor directly on concrete, observable quirks or patterns found in this exact portfolio (e.g., framework choices, missing alt tags, wall of text or missing projects, latency).
   - Keep it fun and inspiring for developers, never mean-spirited or generic.
6. Scores:
   - overallScore, uiUx, performance, accessibility, content (all numbers from 0.0 to 10.0, one decimal).
7. Strengths:
   - 3 to 5 clear, evidence-based strengths found in the analysis.
8. Issues:
   - 2 to 5 concrete issues with title, severity ('high' | 'medium' | 'low'), and description referencing the data.
9. Suggestions:
   - 2 to 4 actionable suggestions with title and description.
10. Return valid JSON only conforming exactly to the requested schema.`;

  const userPrompt = `Here is the structured HTML analysis for the portfolio:
Website URL: ${analysis.url}
Final URL: ${analysis.finalUrl}
Domain: ${analysis.domain}
HTTP Status: ${analysis.httpStatus}
Server Response Time: ${analysis.responseTimeMs}ms
HTML Payload Size: ${(analysis.htmlSizeBytes / 1024).toFixed(1)} KB

=== PAGE IDENTITY & METADATA ===
Title: ${analysis.meta.title || '(None detected)'}
Meta Description: ${analysis.meta.metaDescription || '(None detected)'}
Viewport Configured: ${analysis.meta.hasViewportMeta ? 'Yes (' + analysis.meta.viewport + ')' : 'No viewport meta tag found'}
Canonical URL: ${analysis.meta.canonicalUrl || 'None'}
OpenGraph Title: ${analysis.meta.ogTitle || 'None'}
OpenGraph Description: ${analysis.meta.ogDescription || 'None'}

=== HEADINGS & STRUCTURE ===
H1 Headings: ${JSON.stringify(analysis.headings.h1)}
H2 Headings: ${JSON.stringify(analysis.headings.h2.slice(0, 10))}
Total Headings: ${analysis.headings.totalCount} (H3: ${analysis.headings.h3.length}, H4-H6: ${analysis.headings.h4ToH6Count})

=== CONTENT & PARAGRAPHS ===
Paragraphs Count: ${analysis.paragraphs.count}
Total Word Count: ${analysis.paragraphs.totalWordCount}
Sample Copy Snippets: ${JSON.stringify(analysis.paragraphs.sampleTexts.slice(0, 4))}

=== IMAGES & ACCESSIBILITY ===
Total Images: ${analysis.images.total}
Images Missing Alt Text: ${analysis.images.missingAltCount}
Sample Images: ${JSON.stringify(analysis.images.sampleImages.slice(0, 3))}

=== NAVIGATION & LINKS ===
Has Navigation: ${analysis.navigation.hasNavigation}
Navigation Items: ${JSON.stringify(analysis.navigation.navItems)}
Total Outbound/Inbound Links: ${analysis.links.total} (Internal: ${analysis.links.internalCount}, External: ${analysis.links.externalCount})
Buttons Detected: ${analysis.buttons.count} (Labels: ${JSON.stringify(analysis.buttons.sampleLabels.slice(0, 5))})
Forms Detected: ${analysis.forms.count} (Has Contact Form: ${analysis.forms.hasContactForm}, Has Email Input: ${analysis.forms.hasEmailInput})

=== PORTFOLIO SECTIONS & PROJECTS ===
Has Projects Showcase: ${analysis.portfolioSections.hasProjectsSection}
Detected Project Titles: ${JSON.stringify(analysis.portfolioSections.detectedProjectTitles)}
Detected Tech Tags: ${JSON.stringify(analysis.portfolioSections.detectedTechTags)}
Has About Section: ${analysis.portfolioSections.hasAboutSection}
Has Contact Section: ${analysis.portfolioSections.hasContactSection}
Has Skills Section: ${analysis.portfolioSections.hasSkillsSection}
Has Experience Section: ${analysis.portfolioSections.hasExperienceSection}

=== SOCIAL & CONTACT ===
GitHub: ${analysis.socialLinks.github || 'None'}
LinkedIn: ${analysis.socialLinks.linkedin || 'None'}
Twitter/X: ${analysis.socialLinks.twitterOrX || 'None'}
Email: ${analysis.socialLinks.email || 'None'}

=== SEMANTICS & TECHNOLOGIES ===
HTML5 Landmarks: header=${analysis.semanticSignals.hasHeader}, nav=${analysis.semanticSignals.hasNav}, main=${analysis.semanticSignals.hasMain}, footer=${analysis.semanticSignals.hasFooter}, article=${analysis.semanticSignals.hasArticle}
Semantic Score: ${analysis.semanticSignals.semanticScore}/100
Detected Technologies: ${JSON.stringify(analysis.detectedTechnologies)}
Digest Key Observations: ${JSON.stringify(analysis.aiDigest.keyObservations)}

Please evaluate this portfolio strictly adhering to the schema and return valid JSON only.`;

  const modelsToTry = [
    { name: 'gemini-3.8-flash', timeoutMs: 9500 },
    { name: 'gemini-3.1-flash-lite', timeoutMs: 7000 },
  ];
  let lastError: unknown = null;

  for (const { name: modelName, timeoutMs } of modelsToTry) {
    try {
      const aiCallPromise = client.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: {
                type: Type.NUMBER,
                description: 'Overall portfolio rating from 0.0 to 10.0.',
              },
              uiUx: {
                type: Type.NUMBER,
                description: 'UI/UX score from 0.0 to 10.0.',
              },
              performance: {
                type: Type.NUMBER,
                description: 'Performance score from 0.0 to 10.0.',
              },
              accessibility: {
                type: Type.NUMBER,
                description: 'Accessibility score from 0.0 to 10.0.',
              },
              content: {
                type: Type.NUMBER,
                description: 'Content quality score from 0.0 to 10.0.',
              },
              summary: {
                type: Type.STRING,
                description: 'Concise 2-3 sentence executive audit summary.',
              },
              roast: {
                type: Type.STRING,
                description: 'Humorous, concise, and constructive developer roast based on the real portfolio signals.',
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 to 5 real strengths evidenced by the data.',
              },
              issues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'Clear issue title' },
                    severity: { type: Type.STRING, description: 'Severity: high, medium, or low' },
                    description: { type: Type.STRING, description: 'Concrete evidence-based description' },
                  },
                  required: ['title', 'severity', 'description'],
                },
                description: 'Real identified issues based strictly on the analysis.',
              },
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'Actionable suggestion title' },
                    description: { type: Type.STRING, description: 'Specific recommendation' },
                  },
                  required: ['title', 'description'],
                },
                description: 'Actionable suggestions for improvement.',
              },
            },
            required: [
              'overallScore',
              'uiUx',
              'performance',
              'accessibility',
              'content',
              'summary',
              'roast',
              'strengths',
              'issues',
              'suggestions',
            ],
          },
        },
      });

      // Strict race timeout so AI call never hangs the server request
      let timer: NodeJS.Timeout;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`AI generation timed out after ${timeoutMs}ms for ${modelName}`)),
          timeoutMs
        );
      });

      const response = await Promise.race([aiCallPromise, timeoutPromise]).finally(() => {
        clearTimeout(timer!);
      });

      const duration = Date.now() - startTime;
      const rawText = response.text;

      if (!rawText) {
        console.warn(`[GeminiService] Empty response received from ${modelName} after ${duration}ms.`);
        continue;
      }

      // Clean potential markdown wrap if any (e.g. ```json ... ```)
      let cleanedText = rawText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseErr) {
        console.warn(
          `[GeminiService] Failed to parse JSON from ${modelName} (${duration}ms):`,
          parseErr instanceof Error ? parseErr.message : 'Syntax error'
        );
        continue;
      }

      const validated = validateAndNormalizeAiAudit(parsed);
      if (!validated) {
        console.warn(`[GeminiService] AI output failed schema validation (${duration}ms).`);
        continue;
      }

      console.log(`[GeminiService] Successfully generated AI portfolio audit with ${modelName} in ${duration}ms for ${analysis.domain}`);
      return validated;
    } catch (error) {
      lastError = error;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[GeminiService] Model ${modelName} encountered: ${errorMsg}`);
    }
  }

  const duration = Date.now() - startTime;
  console.error(
    `[GeminiService] All AI audit attempts failed after ${duration}ms:`,
    lastError instanceof Error ? lastError.message : 'Unknown error'
  );
  return null;
}
