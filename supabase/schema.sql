-- ==============================================================================
-- Supabase / PostgreSQL Schema for "Roast My Portfolio"
-- Run this in your Supabase Project SQL Editor
-- ==============================================================================

-- 1. Create the reviews table with all Phase 5 required fields
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  overall_score NUMERIC(3, 1) NOT NULL,
  ui_ux_score NUMERIC(3, 1),
  performance_score NUMERIC(3, 1),
  accessibility_score NUMERIC(3, 1),
  content_score NUMERIC(3, 1),
  scores JSONB DEFAULT '{}'::jsonb,
  summary TEXT NOT NULL,
  roast TEXT NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  technical_signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Schema migration in case the table was created earlier without individual score columns
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS ui_ux_score NUMERIC(3, 1),
  ADD COLUMN IF NOT EXISTS performance_score NUMERIC(3, 1),
  ADD COLUMN IF NOT EXISTS accessibility_score NUMERIC(3, 1),
  ADD COLUMN IF NOT EXISTS content_score NUMERIC(3, 1);

-- 3. Create indices on domain and created_at for performant querying and ordering
CREATE INDEX IF NOT EXISTS idx_reviews_domain ON public.reviews (domain);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- Allow anyone to read audit reviews (Public read)
DROP POLICY IF EXISTS "Allow public read access" ON public.reviews;
CREATE POLICY "Allow public read access" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

-- Allow server service role key full management access (insert, update, delete)
DROP POLICY IF EXISTS "Allow service role all" ON public.reviews;
CREATE POLICY "Allow service role all" 
  ON public.reviews 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

