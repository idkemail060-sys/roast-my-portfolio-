import { PortfolioReview } from '../../src/types';
import { WebsiteAnalysisResult } from '../types/analyzer';
import { fetchWebsiteHtml } from './websiteFetcher';
import { analyzeHtml } from './htmlAnalyzer';
import { buildReviewFromAnalysis, buildReviewFromAi } from './reviewSynthesizer';
import { generateGeminiPortfolioAudit } from './geminiService';
import { fetchLighthouseMetrics } from './pagespeedService';
import { reviewsRepository } from '../repositories/reviewsRepository';

/**
 * Reviews Service
 *
 * Coordinates website fetching, HTML analysis, Gemini AI audit evaluation,
 * score calculation with backend weighting, and PostgreSQL / Supabase persistence.
 */
class ReviewsService {
  /**
   * Executes the 7-step portfolio audit workflow:
   * 1. Validate URL (pre-validated via SSRF & format checks)
   * 2. Fetch website HTML
   * 3. Analyze website DOM & structural semantics
   * 4. Call Gemini AI portfolio evaluator (with resilient fallback)
   * 5. Calculate final score using backend weighting
   * 6. Save the review to PostgreSQL / Supabase
   * 7. Return the saved review
   */
  async createReview(
    url: string,
    domain: string
  ): Promise<{ review: PortfolioReview; analysis: WebsiteAnalysisResult }> {
    // 1. URL is validated by middleware and verified
    if (!url || !url.startsWith('http')) {
      throw new Error('Valid HTTP/HTTPS URL is required.');
    }

    // 2. Fetch public website HTML with SSRF defense, timeouts, and size caps
    const fetchedData = await fetchWebsiteHtml(url);

    // 3. Analyze HTML DOM with Cheerio
    const analysis = analyzeHtml(
      fetchedData.html,
      url,
      fetchedData.finalUrl,
      domain,
      fetchedData.statusCode,
      fetchedData.contentType,
      fetchedData.responseTimeMs,
      fetchedData.contentLength
    );

    // 4. Concurrently run Gemini AI evaluation and Google PageSpeed / Lighthouse metrics
    let review: PortfolioReview;
    const [aiResult, lighthouseResult] = await Promise.allSettled([
      generateGeminiPortfolioAudit(analysis),
      fetchLighthouseMetrics(url, fetchedData.responseTimeMs),
    ]);

    if (aiResult.status === 'fulfilled' && aiResult.value) {
      review = buildReviewFromAi(analysis, aiResult.value);
    } else {
      if (aiResult.status === 'rejected') {
        console.warn(
          '[ReviewsService] AI evaluation error, falling back to deterministic synthesizer:',
          aiResult.reason instanceof Error ? aiResult.reason.message : 'Unknown AI error'
        );
      }
      review = buildReviewFromAnalysis(analysis);
    }

    // Attach real Lighthouse / PageSpeed lab data
    if (lighthouseResult.status === 'fulfilled' && lighthouseResult.value) {
      if (!review.technicalSignals) {
        review.technicalSignals = {} as any;
      }
      review.technicalSignals.lighthouse = lighthouseResult.value;
    }

    // 5. Calculate final score using backend weighting:
    // UI/UX (30%), Performance (25%), Accessibility (25%), Content (20%)
    const uiUx = Math.max(0, Math.min(10, review.uiUx ?? review.scores.uiUx));
    const performance = Math.max(0, Math.min(10, review.performance ?? review.scores.performance));
    const accessibility = Math.max(0, Math.min(10, review.accessibility ?? review.scores.accessibility));
    const content = Math.max(0, Math.min(10, review.content ?? review.scores.content));

    const backendWeightedScore = parseFloat(
      (uiUx * 0.3 + performance * 0.25 + accessibility * 0.25 + content * 0.2).toFixed(1)
    );

    // Assign consistent normalized score fields across camelCase and snake_case
    review.overallScore = backendWeightedScore;
    review.overall_score = backendWeightedScore;
    review.uiUx = uiUx;
    review.ui_ux_score = uiUx;
    review.performance = performance;
    review.performance_score = performance;
    review.accessibility = accessibility;
    review.accessibility_score = accessibility;
    review.content = content;
    review.content_score = content;
    review.scores = { uiUx, performance, accessibility, content };

    // 6. Save the review to PostgreSQL / Supabase
    const savedReview = await reviewsRepository.save(review);

    // 7. Return the saved review
    return { review: savedReview, analysis };
  }

  /**
   * Retrieves review history ordered newest first.
   */
  async getAllReviews(): Promise<PortfolioReview[]> {
    return await reviewsRepository.findAll();
  }

  /**
   * Retrieves a single review by its ID.
   */
  async getReviewById(id: string): Promise<PortfolioReview | null> {
    return await reviewsRepository.findById(id);
  }

  /**
   * Deletes a review by its ID from PostgreSQL / Supabase.
   */
  async deleteReview(id: string): Promise<boolean> {
    return await reviewsRepository.deleteById(id);
  }

  /**
   * Helper to clear reviews cache (useful for testing).
   */
  clearCache(): void {
    reviewsRepository.clearCache();
  }
}

export const reviewsService = new ReviewsService();

