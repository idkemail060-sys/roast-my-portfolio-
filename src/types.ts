export interface CategoryScores {
  uiUx: number; // 0 - 10
  performance: number; // 0 - 10
  accessibility: number; // 0 - 10
  content: number; // 0 - 10
}

export type IssueSeverity = 'high' | 'medium' | 'low';

export interface AuditIssue {
  id: string;
  title: string;
  severity: IssueSeverity;
  description: string;
  category: 'uiUx' | 'performance' | 'accessibility' | 'content';
}

export interface AuditSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface LighthouseMetrics {
  fcp?: string; // First Contentful Paint
  fcpScore?: number; // 0 - 100
  lcp?: string; // Largest Contentful Paint
  lcpScore?: number; // 0 - 100
  cls?: string; // Cumulative Layout Shift
  clsScore?: number; // 0 - 100
  tbt?: string; // Total Blocking Time
  tbtScore?: number; // 0 - 100
  speedIndex?: string; // Speed Index
  performanceScore?: number; // 0 - 100
  accessibilityScore?: number; // 0 - 100
  source?: 'pagespeed_api' | 'server_latency_benchmark';
}

export interface ObservableSignals {
  title?: string;
  hasMetaDescription: boolean;
  h1Count: number;
  headingsCount: number;
  totalImages: number;
  imagesMissingAlt: number;
  totalLinks: number;
  hasNavigation: boolean;
  hasContactOrSocial: boolean;
  hasViewportMeta: boolean;
  loadTimeEstimateMs?: number;
  detectedTechnologies?: string[];
  lighthouse?: LighthouseMetrics;
}

export interface PortfolioReview {
  id: string;
  url: string;
  domain: string;
  overallScore: number;
  overall_score?: number;
  scores: CategoryScores;
  uiUx?: number;
  performance?: number;
  accessibility?: number;
  content?: number;
  ui_ux_score?: number;
  performance_score?: number;
  accessibility_score?: number;
  content_score?: number;
  summary: string;
  roast: string;
  strengths: string[];
  issues: AuditIssue[];
  suggestions: AuditSuggestion[];
  technicalSignals: ObservableSignals;
  analysis?: any;
  createdAt: string;
  created_at?: string;
}

export type LoadingStage = 
  | 'idle'
  | 'validating'
  | 'inspecting'
  | 'analyzing'
  | 'consulting_ai'
  | 'finalizing'
  | 'completed';

export interface LoadingStepInfo {
  key: LoadingStage;
  label: string;
  detail: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode?: number;
    details?: unknown;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  count?: number;
  message?: string;
  id?: string;
  url?: string;
  domain?: string;
  overallScore?: number;
  overall_score?: number;
  uiUx?: number;
  ui_ux_score?: number;
  performance?: number;
  performance_score?: number;
  accessibility?: number;
  accessibility_score?: number;
  content?: number;
  content_score?: number;
  summary?: string;
  roast?: string;
  strengths?: string[];
  issues?: AuditIssue[];
  suggestions?: AuditSuggestion[];
  createdAt?: string;
  created_at?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
