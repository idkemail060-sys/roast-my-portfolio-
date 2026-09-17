/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { LoadingState } from './components/landing/LoadingState';
import { HowItWorksSection } from './components/landing/HowItWorksSection';
import { FeatureSection } from './components/landing/FeatureSection';
import { ExampleScoreSection } from './components/landing/ExampleScoreSection';
import { ResultsPage } from './components/results/ResultsPage';
import { HistoryModal } from './components/history/HistoryModal';
import { PortfolioReview } from './types';
import { reviewsApi, ApiClientError } from './services/api';
import BlackHole from '@/components/ui/black-hole';
import DemoOne from '@/components/ui/demo';

const REAL_HISTORY_STORAGE_KEY = 'roast_portfolio_real_history_v1';

/**
 * Extracts a review ID from the current browser URL:
 * Supports:
 * - /?review=:id or /?id=:id
 * - /reviews/:id
 * - #/reviews/:id or #review/:id
 */
function getReviewIdFromUrl(): string | null {
  try {
    const url = new URL(window.location.href);
    const paramId = url.searchParams.get('review') || url.searchParams.get('id');
    if (paramId) return paramId.trim();

    const pathMatches = url.pathname.match(/\/reviews\/([^/?#]+)/);
    if (pathMatches && pathMatches[1]) return decodeURIComponent(pathMatches[1]).trim();

    const hash = window.location.hash;
    const hashMatches = hash.match(/#\/?reviews?\/([^/?#]+)/);
    if (hashMatches && hashMatches[1]) return decodeURIComponent(hashMatches[1]).trim();
  } catch {
    // Fallback if URL parsing encounters edge issues
  }
  return null;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'results' | 'demo'>('landing');
  const [currentReview, setCurrentReview] = useState<PortfolioReview | null>(null);
  
  // History strictly reflects real audits stored in PostgreSQL
  const [historyReviews, setHistoryReviews] = useState<PortfolioReview[]>(() => {
    try {
      const stored = localStorage.getItem(REAL_HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore parsing error
    }
    return [];
  });

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditedUrl, setAuditedUrl] = useState('');
  const [auditError, setAuditError] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Route-based loading state
  const [isLoadingRouteReview, setIsLoadingRouteReview] = useState(false);
  const [routeReviewError, setRouteReviewError] = useState<string | null>(null);

  // Load a review by ID (from cache or API)
  const loadReviewById = useCallback(async (reviewId: string) => {
    // Check local state first for instant responsiveness
    const cached = historyReviews.find((r) => r.id === reviewId);
    if (cached) {
      setCurrentReview(cached);
      setCurrentView('results');
      setRouteReviewError(null);
      return;
    }

    setIsLoadingRouteReview(true);
    setRouteReviewError(null);

    try {
      const fetched = await reviewsApi.getReviewById(reviewId);
      setCurrentReview(fetched);
      setCurrentView('results');
      setHistoryReviews((prev) => {
        const map = new Map<string, PortfolioReview>();
        map.set(fetched.id, fetched);
        prev.forEach((r) => {
          if (!map.has(r.id)) map.set(r.id, r);
        });
        return Array.from(map.values());
      });
    } catch (err: unknown) {
      console.error(`Failed to load review ID "${reviewId}":`, err);
      const msg = err instanceof ApiClientError
        ? err.message
        : err instanceof Error
        ? err.message
        : 'Failed to load portfolio review report.';
      setRouteReviewError(msg);
      setCurrentView('results');
    } finally {
      setIsLoadingRouteReview(false);
    }
  }, [historyReviews]);

  // Initial fetch from backend GET /api/reviews and handle route-based review ID
  useEffect(() => {
    reviewsApi.getReviews()
      .then((reviews) => {
        if (Array.isArray(reviews) && reviews.length > 0) {
          setHistoryReviews((prev) => {
            const map = new Map<string, PortfolioReview>();
            reviews.forEach((r) => map.set(r.id, r));
            prev.forEach((r) => {
              if (!map.has(r.id)) map.set(r.id, r);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => {
        console.warn('Initial review fetch from backend warning:', err);
      });

    // Check if URL directly contains a review ID or demo view
    const initialReviewId = getReviewIdFromUrl();
    if (initialReviewId) {
      loadReviewById(initialReviewId);
    } else {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      if (hash === '#demo' || hash === '#constellation' || urlParams.get('demo') === 'constellation' || urlParams.has('demo')) {
        setCurrentView('demo');
      }
    }
  }, [loadReviewById]);

  // Listen to browser popstate (Back/Forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const reviewId = getReviewIdFromUrl();
      if (reviewId) {
        loadReviewById(reviewId);
      } else {
        const hash = window.location.hash;
        if (hash === '#demo' || hash === '#constellation') {
          setCurrentView('demo');
        } else {
          setCurrentView('landing');
          setCurrentReview(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [loadReviewById]);

  // Sync review history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REAL_HISTORY_STORAGE_KEY, JSON.stringify(historyReviews));
    } catch {
      // ignore storage quota error
    }
  }, [historyReviews]);

  // Handle URL submission from the Hero Section form
  const handleAuditUrl = async (url: string) => {
    setAuditedUrl(url);
    setIsAuditing(true);
    setAuditError(null);

    // Scroll smoothly to loading area
    window.scrollTo({ top: 180, behavior: 'smooth' });

    try {
      // Real API call to POST /api/reviews
      const newReview = await reviewsApi.auditPortfolio(url);

      // Successfully generated audit report
      setHistoryReviews((prev) => [newReview, ...prev.filter((r) => r.id !== newReview.id)]);
      setCurrentReview(newReview);
      setIsAuditing(false);
      setAuditError(null);
      setCurrentView('results');

      // Update browser URL with route-based review ID
      try {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('review', newReview.id);
        window.history.pushState({ reviewId: newReview.id }, '', newUrl.toString());
      } catch {
        // ignore history state error
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Audit request error:', err);
      let errorMsg = 'An unexpected error occurred while connecting to the audit backend.';
      if (err instanceof ApiClientError) {
        errorMsg = err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setAuditError(errorMsg);
      // Keep isAuditing true so LoadingState renders the high-contrast error card with Retry option
    }
  };

  const handleRetryAudit = () => {
    if (auditedUrl) {
      handleAuditUrl(auditedUrl);
    }
  };

  const handleCancelAudit = () => {
    setIsAuditing(false);
    setAuditError(null);
  };

  const handleSelectReview = (review: PortfolioReview) => {
    setCurrentReview(review);
    setCurrentView('results');
    setRouteReviewError(null);

    try {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('review', review.id);
      window.history.pushState({ reviewId: review.id }, '', newUrl.toString());
    } catch {
      // ignore history push error
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setIsAuditing(false);
    setAuditError(null);
    setCurrentReview(null);
    setCurrentView('landing');

    try {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('review');
      newUrl.searchParams.delete('id');
      newUrl.searchParams.delete('demo');
      window.history.pushState({}, '', newUrl.pathname);
    } catch {
      // ignore
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistoryReviews([]);
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await reviewsApi.deleteReview(id);
    } catch (err) {
      console.warn('Could not sync review deletion with server:', err);
    }
    setHistoryReviews((prev) => prev.filter((r) => r.id !== id));
    if (currentReview?.id === id) {
      handleNavigateHome();
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-300">
      {/* 21st.dev Black Hole Background Effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
        aria-hidden="true"
      >
        <div className="absolute inset-0 opacity-70">
          <BlackHole />
        </div>
        {/* Optical scrims to ensure UI readability and pass WCAG AA contrast */}
        <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-neutral-950/90" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <Navbar
          currentView={currentView}
          onNavigateHome={handleNavigateHome}
          onOpenHistory={() => setShowHistoryModal(true)}
          historyCount={historyReviews.length}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {currentView === 'demo' ? (
            <div className="relative w-full min-h-screen">
              <div className="fixed top-4 left-4 z-50">
                <button
                  onClick={handleNavigateHome}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900/95 hover:bg-neutral-800 border border-neutral-700 hover:border-orange-500/60 text-neutral-100 hover:text-white text-xs font-mono shadow-2xl backdrop-blur-md cursor-pointer transition-all active:scale-95"
                >
                  <span>&larr; Exit Demo & Return Home</span>
                </button>
              </div>
              <DemoOne />
            </div>
          ) : currentView === 'landing' ? (
            <div>
              {/* Hero & Submission Form */}
              <HeroSection onSubmitUrl={handleAuditUrl} isLoading={isAuditing} />

              {/* In-flight loading animation or error state when auditing */}
              {isAuditing && (
                <div className="max-w-5xl mx-auto px-4 -mt-8 mb-16 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <LoadingState
                    url={auditedUrl}
                    error={auditError}
                    onRetry={handleRetryAudit}
                    onCancel={handleCancelAudit}
                  />
                </div>
              )}

              {/* How It Works Section */}
              <HowItWorksSection />

              {/* Feature Highlights Grid */}
              <FeatureSection />

              {/* Interactive Showcase with Real Audits */}
              <ExampleScoreSection
                onSelectReview={handleSelectReview}
                reviews={historyReviews}
              />
            </div>
          ) : (
            <ResultsPage
              review={currentReview}
              isLoading={isLoadingRouteReview}
              error={routeReviewError}
              onBackToHome={handleNavigateHome}
              onRetry={auditedUrl ? handleRetryAudit : undefined}
              onDelete={handleDeleteReview}
              onOpenHistory={() => setShowHistoryModal(true)}
              historyCount={historyReviews.length}
            />
          )}
        </main>

        {/* Review History Drawer / Modal */}
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          reviews={historyReviews}
          onSelectReview={handleSelectReview}
          onClearHistory={handleClearHistory}
          onDeleteReview={handleDeleteReview}
        />

        {/* Developer Tool Footer */}
        <Footer />
      </div>
    </div>
  );
}
