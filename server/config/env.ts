import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  requestTimeoutMs: Math.max(65000, parseInt(process.env.REQUEST_TIMEOUT_MS || '65000', 10)),
  // Placeholders ready for Gemini & PostgreSQL in subsequent phases
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  // Supabase Configuration
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};
