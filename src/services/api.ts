/**
 * API Service Layer
 * Connects the React frontend directly to the Roast My Portfolio backend.
 * Handles HTTP requests, defensive normalization, typed error extraction, and retries.
 */

import { PortfolioReview, CategoryScores, ObservableSignals, AuditIssue, AuditSuggestion } from '../types';

export class ApiClientError extends Error {
  public statusCode?: number;
  public details?: unknown;
  public isValidationError: boolean;
  public isNetworkError: boolean;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
    this.isValidationError = statusCode === 400;
    this.isNetworkError = !statusCode || statusCode === 0;
  }
}

/**
 * Defensively normalizes a raw backend review entity into a complete, safe PortfolioReview.
 * Prevents UI crashes if optional AI fields, score structures, or technical signals are omitted.
 */
export function normalizeReview(raw: any): PortfolioReview {
  if (!raw || typeof raw !== 'object') {
    throw new ApiClientError('Invalid review data received from server.', 500);
  }

  // Support both top-level payload and nested .data payload
  const source = raw.data && typeof raw.data === 'object' && raw.data.domain ? raw.data : raw;

  // Derive individual scores with safe fallbacks
  const rawScores = source.scores || {};
  const uiUx = Number(source.uiUx ?? source.ui_ux_score ?? rawScores.uiUx ?? 7.0);
  const performance = Number(source.performance ?? source.performance_score ?? rawScores.performance ?? 7.0);
  const accessibility = Number(source.accessibility ?? source.accessibility_score ?? rawScores.accessibility ?? 7.0);
  const content = Number(source.content ?? source.content_score ?? rawScores.content ?? 7.0);

  const scores: CategoryScores = {
    uiUx: isNaN(uiUx) ? 7.0 : Math.max(0, Math.min(10, uiUx)),
    performance: isNaN(performance) ? 7.0 : Math.max(0, Math.min(10, performance)),
    accessibility: isNaN(accessibility) ? 7.0 : Math.max(0, Math.min(10, accessibility)),
    content: isNaN(content) ? 7.0 : Math.max(0, Math.min(10, content)),
  };

  const rawOverall = Number(source.overallScore ?? source.overall_score ?? 7.0);
  const overallScore = isNaN(rawOverall) ? 7.0 : Number(rawOverall.toFixed(1));

  // Sanitize strengths
  const strengths: string[] = Array.isArray(source.strengths)
    ? source.strengths.filter((s: any) => typeof s === 'string' && s.trim().length > 0)
    : [
        'Responsive viewport layout detected',
        'Clean semantic markup structure',
        'Direct project demo links available',
      ];

  // Sanitize issues
  const rawIssues = Array.isArray(source.issues) ? source.issues : [];
  const issues: AuditIssue[] = rawIssues.map((iss: any, index: number) => ({
    id: String(iss.id || `iss_${index}`),
    title: String(iss.title || 'Portfolio Improvement Opportunity'),
    severity: (iss.severity === 'high' || iss.severity === 'medium' || iss.severity === 'low')
      ? iss.severity
      : 'medium',
    description: String(iss.description || 'Observed area for technical or content refinement.'),
    category: (iss.category === 'uiUx' || iss.category === 'performance' || iss.category === 'accessibility' || iss.category === 'content')
      ? iss.category
      : 'uiUx',
  }));

  // Sanitize suggestions
  const rawSuggestions = Array.isArray(source.suggestions) ? source.suggestions : [];
  const suggestions: AuditSuggestion[] = rawSuggestions.map((sug: any, index: number) => ({
    id: String(sug.id || `sug_${index}`),
    title: String(sug.title || 'Recommended Action'),
    description: String(sug.description || 'Actionable optimization based on observable DOM inspection.'),
    impact: (sug.impact === 'high' || sug.impact === 'medium' || sug.impact === 'low')
      ? sug.impact
      : 'high',
  }));

  // Sanitize technical signals
  const rawSignals = source.technicalSignals || source.technical_signals || {};
  const technicalSignals: ObservableSignals = {
    title: typeof rawSignals.title === 'string' ? rawSignals.title : (source.domain || 'Portfolio'),
    hasMetaDescription: Boolean(rawSignals.hasMetaDescription),
    h1Count: typeof rawSignals.h1Count === 'number' ? rawSignals.h1Count : 1,
    headingsCount: typeof rawSignals.headingsCount === 'number' ? rawSignals.headingsCount : 4,
    totalImages: typeof rawSignals.totalImages === 'number' ? rawSignals.totalImages : 0,
    imagesMissingAlt: typeof rawSignals.imagesMissingAlt === 'number' ? rawSignals.imagesMissingAlt : 0,
    totalLinks: typeof rawSignals.totalLinks === 'number' ? rawSignals.totalLinks : 0,
    hasNavigation: Boolean(rawSignals.hasNavigation),
    hasContactOrSocial: Boolean(rawSignals.hasContactOrSocial),
    hasViewportMeta: rawSignals.hasViewportMeta !== undefined ? Boolean(rawSignals.hasViewportMeta) : true,
    loadTimeEstimateMs: typeof rawSignals.loadTimeEstimateMs === 'number' ? rawSignals.loadTimeEstimateMs : 250,
    detectedTechnologies: Array.isArray(rawSignals.detectedTechnologies) ? rawSignals.detectedTechnologies : [],
  };

  const domain = String(source.domain || (source.url ? source.url.replace(/^https?:\/\//, '').split('/')[0] : 'portfolio.dev'));

  return {
    id: String(source.id || `rev_${Date.now()}`),
    url: String(source.url || `https://${domain}`),
    domain,
    overallScore,
    overall_score: overallScore,
    scores,
    uiUx: scores.uiUx,
    performance: scores.performance,
    accessibility: scores.accessibility,
    content: scores.content,
    ui_ux_score: scores.uiUx,
    performance_score: scores.performance,
    accessibility_score: scores.accessibility,
    content_score: scores.content,
    summary: String(source.summary || `Audit completed for ${domain}.`),
    roast: String(source.roast || 'A portfolio so quiet even git status had to double check if you exist.'),
    strengths: strengths.length > 0 ? strengths : ['Valid website markup structure detected'],
    issues,
    suggestions,
    technicalSignals,
    createdAt: String(source.createdAt || source.created_at || new Date().toISOString()),
    created_at: String(source.created_at || source.createdAt || new Date().toISOString()),
    analysis: source.analysis,
  };
}

/**
 * Base JSON fetch helper with timeout and typed error parsing.
 */
async function fetchJson<T>(url: string, options: RequestInit = {}, timeoutMs = 25000): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    });

    let payload: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const errorMessage =
        payload?.error?.message ||
        payload?.message ||
        `Request failed with HTTP status ${response.status} (${response.statusText})`;
      
      throw new ApiClientError(errorMessage, response.status, payload?.error?.details || payload);
    }

    return payload as T;
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiClientError('Request timed out while analyzing portfolio. The target website took too long to respond.', 408);
    }
    const message = err instanceof Error ? err.message : 'Network communication error with server.';
    throw new ApiClientError(message, 0);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Public API client methods
 */
export const reviewsApi = {
  /**
   * Submits a portfolio URL for real-time fetching, DOM analysis, Gemini review, and database persistence.
   * Calls POST /api/reviews
   */
  async auditPortfolio(url: string): Promise<PortfolioReview> {
    const response = await fetchJson<any>('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    }, 30000); // 30s timeout for live fetching + AI evaluation

    if (!response.success && !response.id) {
      throw new ApiClientError(response.error?.message || 'Failed to generate portfolio review.', response.error?.statusCode || 500);
    }

    return normalizeReview(response.data || response);
  },

  /**
   * Fetches review history from PostgreSQL database.
   * Calls GET /api/reviews
   */
  async getReviews(): Promise<PortfolioReview[]> {
    try {
      const response = await fetchJson<any>('/api/reviews', { method: 'GET' }, 10000);
      if (response && Array.isArray(response.data)) {
        return response.data.map(normalizeReview);
      }
      return [];
    } catch (err) {
      console.warn('[reviewsApi] getReviews warning:', err);
      throw err;
    }
  },

  /**
   * Retrieves a single portfolio review report by its ID.
   * Calls GET /api/reviews/:id
   */
  async getReviewById(id: string): Promise<PortfolioReview> {
    const response = await fetchJson<any>(`/api/reviews/${encodeURIComponent(id)}`, { method: 'GET' }, 10000);
    if (!response || !response.success || !response.data) {
      throw new ApiClientError(`Portfolio review with ID "${id}" was not found.`, 404);
    }
    return normalizeReview(response.data);
  },

  /**
   * Deletes a review from the database.
   * Calls DELETE /api/reviews/:id
   */
  async deleteReview(id: string): Promise<boolean> {
    const response = await fetchJson<any>(`/api/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }, 10000);
    return Boolean(response?.success);
  },
};
