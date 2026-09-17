import { PortfolioReview, AuditIssue, AuditSuggestion } from '../../src/types';
import { getSupabaseClient } from '../lib/supabase';

/**
 * PostgreSQL / Supabase Review Row Structure
 * Represents the persistent database schema for portfolio audits.
 */
export interface ReviewDatabaseRow {
  id: string;
  url: string;
  domain: string;
  overall_score: number;
  ui_ux_score?: number;
  performance_score?: number;
  accessibility_score?: number;
  content_score?: number;
  scores?: {
    uiUx: number;
    performance: number;
    accessibility: number;
    content: number;
  };
  summary: string;
  roast: string;
  strengths: string[];
  issues: AuditIssue[];
  suggestions: AuditSuggestion[];
  technical_signals?: Record<string, unknown>;
  created_at: string;
}

/**
 * Maps a PortfolioReview domain entity to the PostgreSQL database row structure.
 */
export function mapReviewToDatabaseRow(review: PortfolioReview): ReviewDatabaseRow {
  const uiUx = review.uiUx ?? review.scores?.uiUx ?? 0;
  const performance = review.performance ?? review.scores?.performance ?? 0;
  const accessibility = review.accessibility ?? review.scores?.accessibility ?? 0;
  const content = review.content ?? review.scores?.content ?? 0;

  return {
    id: review.id,
    url: review.url,
    domain: review.domain,
    overall_score: Number(review.overallScore),
    ui_ux_score: Number(uiUx),
    performance_score: Number(performance),
    accessibility_score: Number(accessibility),
    content_score: Number(content),
    scores: {
      uiUx: Number(uiUx),
      performance: Number(performance),
      accessibility: Number(accessibility),
      content: Number(content),
    },
    summary: review.summary,
    roast: review.roast,
    strengths: Array.isArray(review.strengths) ? review.strengths : [],
    issues: Array.isArray(review.issues) ? review.issues : [],
    suggestions: Array.isArray(review.suggestions) ? review.suggestions : [],
    technical_signals: (review.technicalSignals || {}) as Record<string, unknown>,
    created_at: review.createdAt || new Date().toISOString(),
  };
}

/**
 * Maps a PostgreSQL database row back into the PortfolioReview domain entity.
 */
export function mapDatabaseRowToReview(row: ReviewDatabaseRow): PortfolioReview {
  const uiUx =
    row.ui_ux_score !== undefined && row.ui_ux_score !== null
      ? Number(row.ui_ux_score)
      : Number(row.scores?.uiUx ?? 0);

  const performance =
    row.performance_score !== undefined && row.performance_score !== null
      ? Number(row.performance_score)
      : Number(row.scores?.performance ?? 0);

  const accessibility =
    row.accessibility_score !== undefined && row.accessibility_score !== null
      ? Number(row.accessibility_score)
      : Number(row.scores?.accessibility ?? 0);

  const content =
    row.content_score !== undefined && row.content_score !== null
      ? Number(row.content_score)
      : Number(row.scores?.content ?? 0);

  const overallScore = Number(row.overall_score);
  const createdAt = row.created_at;

  return {
    id: row.id,
    url: row.url,
    domain: row.domain,
    overallScore,
    overall_score: overallScore,
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
    ui_ux_score: uiUx,
    performance_score: performance,
    accessibility_score: accessibility,
    content_score: content,
    summary: row.summary,
    roast: row.roast,
    strengths: Array.isArray(row.strengths) ? row.strengths : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    issues: (Array.isArray(row.issues) ? row.issues : []) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    suggestions: (Array.isArray(row.suggestions) ? row.suggestions : []) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    technicalSignals: (row.technical_signals || {}) as any,
    createdAt,
    created_at: createdAt,
  };
}

/**
 * Repository layer for PostgreSQL database operations on reviews.
 * Features:
 * - Direct persistence to Supabase / PostgreSQL.
 * - Graceful schema fallback (handles both flat score columns and JSONB scores).
 * - Synchronized in-memory cache for high availability and offline resilience.
 * - Robust error handling that never exposes database credentials or sensitive details.
 */
export class ReviewsRepository {
  private memoryCache: Map<string, PortfolioReview> = new Map();

  /**
   * Persists a portfolio review to PostgreSQL / Supabase and memory cache.
   */
  async save(review: PortfolioReview): Promise<PortfolioReview> {
    // 1. Immediately cache in memory
    this.memoryCache.set(review.id, review);

    const client = getSupabaseClient();
    if (!client) {
      console.warn('[ReviewsRepository] Supabase not configured; stored review in memory store.');
      return review;
    }

    const fullRow = mapReviewToDatabaseRow(review);

    try {
      // First attempt: insert with all columns (including individual score columns)
      const { error } = await client.from('reviews').insert(fullRow);

      if (!error) {
        return review;
      }

      // If schema cache indicates missing individual score column (PGRST204), fallback to inserting JSONB scores
      if (error.code === 'PGRST204' && (error.message.includes('_score') || error.message.includes('column'))) {
        const legacyRow: Record<string, unknown> = {
          id: fullRow.id,
          url: fullRow.url,
          domain: fullRow.domain,
          overall_score: fullRow.overall_score,
          scores: fullRow.scores,
          summary: fullRow.summary,
          roast: fullRow.roast,
          strengths: fullRow.strengths,
          issues: fullRow.issues,
          suggestions: fullRow.suggestions,
          technical_signals: fullRow.technical_signals,
          created_at: fullRow.created_at,
        };

        const { error: fallbackError } = await client.from('reviews').insert(legacyRow);
        if (fallbackError) {
          console.warn('[ReviewsRepository] Supabase insert fallback warning:', fallbackError.message);
        }
        return review;
      }

      console.warn('[ReviewsRepository] Supabase insert warning:', error.message);
      return review;
    } catch (err) {
      console.error('[ReviewsRepository] Database exception during save:', err instanceof Error ? err.message : err);
      return review;
    }
  }

  /**
   * Retrieves all reviews ordered by created_at DESC.
   */
  async findAll(): Promise<PortfolioReview[]> {
    const client = getSupabaseClient();
    if (!client) {
      return Array.from(this.memoryCache.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    try {
      const { data, error } = await client
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[ReviewsRepository] Supabase findAll warning:', error.message);
        return Array.from(this.memoryCache.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (data && Array.isArray(data)) {
        const domainReviews = (data as ReviewDatabaseRow[]).map(mapDatabaseRowToReview);
        // Sync to memory cache
        domainReviews.forEach((r) => this.memoryCache.set(r.id, r));
        return domainReviews;
      }

      return Array.from(this.memoryCache.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      console.error('[ReviewsRepository] Database exception during findAll:', err instanceof Error ? err.message : err);
      return Array.from(this.memoryCache.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  /**
   * Retrieves a single review by its ID.
   */
  async findById(id: string): Promise<PortfolioReview | null> {
    const client = getSupabaseClient();
    if (!client) {
      return this.memoryCache.get(id) || null;
    }

    try {
      const { data, error } = await client
        .from('reviews')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.warn(`[ReviewsRepository] Supabase findById (${id}) warning:`, error.message);
        return this.memoryCache.get(id) || null;
      }

      if (data) {
        const review = mapDatabaseRowToReview(data as ReviewDatabaseRow);
        this.memoryCache.set(review.id, review);
        return review;
      }

      return this.memoryCache.get(id) || null;
    } catch (err) {
      console.error(`[ReviewsRepository] Database exception during findById (${id}):`, err instanceof Error ? err.message : err);
      return this.memoryCache.get(id) || null;
    }
  }

  /**
   * Deletes a review by its ID from the database and memory cache.
   */
  async deleteById(id: string): Promise<boolean> {
    const existsInMemory = this.memoryCache.has(id);
    this.memoryCache.delete(id);

    const client = getSupabaseClient();
    if (!client) {
      return existsInMemory;
    }

    try {
      const { error, count } = await client
        .from('reviews')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) {
        console.warn(`[ReviewsRepository] Supabase deleteById (${id}) warning:`, error.message);
        return existsInMemory;
      }

      const rowsAffected = count ?? 0;
      return rowsAffected > 0 || existsInMemory;
    } catch (err) {
      console.error(`[ReviewsRepository] Database exception during deleteById (${id}):`, err instanceof Error ? err.message : err);
      return existsInMemory;
    }
  }

  /**
   * Helper to clear memory cache (useful in tests).
   */
  clearCache(): void {
    this.memoryCache.clear();
  }
}

export const reviewsRepository = new ReviewsRepository();
