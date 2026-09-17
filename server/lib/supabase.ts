import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import { PortfolioReview } from '../../src/types';

let supabaseClient: SupabaseClient | null = null;
let hasLoggedTableMissingWarning = false;

/**
 * Returns a lazy-initialized Supabase client using the service role key.
 * Keeps keys strictly on the server side.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

/**
 * Database schema representation for the reviews table in Supabase.
 */
export interface SupabaseReviewRow {
  id: string;
  url: string;
  domain: string;
  overall_score: number;
  scores: {
    uiUx: number;
    performance: number;
    accessibility: number;
    content: number;
  };
  summary: string;
  roast: string;
  strengths: string[];
  issues: unknown[];
  suggestions: unknown[];
  technical_signals: unknown;
  created_at: string;
}

/**
 * Maps a PortfolioReview object into the Supabase row structure.
 */
export function mapReviewToRow(review: PortfolioReview): SupabaseReviewRow {
  return {
    id: review.id,
    url: review.url,
    domain: review.domain,
    overall_score: review.overallScore,
    scores: review.scores,
    summary: review.summary,
    roast: review.roast,
    strengths: review.strengths,
    issues: review.issues,
    suggestions: review.suggestions,
    technical_signals: review.technicalSignals,
    created_at: review.createdAt,
  };
}

/**
 * Maps a Supabase row back to the application's PortfolioReview domain model.
 */
export function mapRowToReview(row: SupabaseReviewRow): PortfolioReview {
  return {
    id: row.id,
    url: row.url,
    domain: row.domain,
    overallScore: Number(row.overall_score),
    scores: {
      uiUx: Number(row.scores?.uiUx ?? 0),
      performance: Number(row.scores?.performance ?? 0),
      accessibility: Number(row.scores?.accessibility ?? 0),
      content: Number(row.scores?.content ?? 0),
    },
    summary: row.summary,
    roast: row.roast,
    strengths: Array.isArray(row.strengths) ? row.strengths : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    issues: (Array.isArray(row.issues) ? row.issues : []) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    suggestions: (Array.isArray(row.suggestions) ? row.suggestions : []) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    technicalSignals: (row.technical_signals || {}) as any,
    createdAt: row.created_at,
  };
}

/**
 * Tests the Supabase connection and reports table status.
 */
export async function checkSupabaseStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  tableReady: boolean;
  projectUrl: string;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      configured: false,
      connected: false,
      tableReady: false,
      projectUrl: config.supabaseUrl,
      message: 'Supabase credentials not configured',
    };
  }

  try {
    const { error } = await client.from('reviews').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST205') {
        return {
          configured: true,
          connected: true,
          tableReady: false,
          projectUrl: config.supabaseUrl,
          message: 'Supabase connected! Table "public.reviews" not created yet in SQL editor.',
        };
      }
      return {
        configured: true,
        connected: false,
        tableReady: false,
        projectUrl: config.supabaseUrl,
        message: `Supabase error: ${error.message} (${error.code})`,
      };
    }

    return {
      configured: true,
      connected: true,
      tableReady: true,
      projectUrl: config.supabaseUrl,
      message: 'Supabase connected and reviews table is active.',
    };
  } catch (err: unknown) {
    return {
      configured: true,
      connected: false,
      tableReady: false,
      projectUrl: config.supabaseUrl,
      message: err instanceof Error ? err.message : 'Unknown connection error',
    };
  }
}

/**
 * Inserts a review into Supabase. If the table doesn't exist yet, returns false.
 */
export async function insertReviewToSupabase(review: PortfolioReview): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = mapReviewToRow(review);
    const { error } = await client.from('reviews').insert(row);

    if (error) {
      if (error.code === 'PGRST205') {
        if (!hasLoggedTableMissingWarning) {
          console.warn(
            '[Supabase] Table "public.reviews" not created yet. Operating in dual mode with memory persistence.'
          );
          hasLoggedTableMissingWarning = true;
        }
        return false;
      }
      console.error('[Supabase Insert Error]', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Supabase Insert Exception]', err);
    return false;
  }
}

/**
 * Fetches all reviews from Supabase.
 */
export async function fetchReviewsFromSupabase(): Promise<PortfolioReview[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') return null;
      console.error('[Supabase Fetch Error]', error);
      return null;
    }

    return (data as SupabaseReviewRow[]).map(mapRowToReview);
  } catch (err) {
    console.error('[Supabase Fetch Exception]', err);
    return null;
  }
}

/**
 * Fetches a single review by its ID from Supabase.
 */
export async function fetchReviewByIdFromSupabase(id: string): Promise<PortfolioReview | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('reviews')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST205') return null;
      console.error('[Supabase Fetch By ID Error]', error);
      return null;
    }

    if (!data) return null;
    return mapRowToReview(data as SupabaseReviewRow);
  } catch (err) {
    console.error('[Supabase Fetch By ID Exception]', err);
    return null;
  }
}

/**
 * Deletes a review by its ID from Supabase.
 */
export async function deleteReviewFromSupabase(id: string): Promise<boolean | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { error, count } = await client
      .from('reviews')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST205') return null;
      console.error('[Supabase Delete Error]', error);
      return null;
    }

    return (count ?? 1) > 0;
  } catch (err) {
    console.error('[Supabase Delete Exception]', err);
    return null;
  }
}
