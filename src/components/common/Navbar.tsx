import React, { useState } from 'react';
import { Flame, Code2, History, Menu, X, Terminal, ExternalLink } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'results' | 'demo';
  onNavigateHome: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateHome,
  onOpenHistory,
  historyCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'landing') {
      onNavigateHome();
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:border-orange-500/60 transition-colors">
            <Flame className="w-5 h-5 text-orange-400 fill-orange-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-100 tracking-tight text-base sm:text-lg">
                Roast My Portfolio
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              AI-Powered Developer Portfolio Auditor
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-neutral-400 hover:text-neutral-100 transition-colors font-medium"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="text-neutral-400 hover:text-neutral-100 transition-colors font-medium"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('examples')}
            className="text-neutral-400 hover:text-neutral-100 transition-colors font-medium"
          >
            Live Examples
          </button>

          <div className="h-4 w-px bg-neutral-800" />

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 hover:bg-neutral-850 text-neutral-200 text-xs font-mono transition-colors"
            title="View Review History"
          >
            <History className="w-3.5 h-3.5 text-neutral-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {currentView === 'results' && (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Audit New URL</span>
            </button>
          )}
        </nav>

        {/* Mobile Menu Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-md border border-neutral-800 text-neutral-300 relative"
            aria-label="History"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-[10px] font-bold flex items-center justify-center text-white">
                {historyCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-900"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-neutral-950 px-4 pt-3 pb-5 space-y-3">
          <div className="pb-2 border-b border-neutral-900">
            <span className="text-xs font-mono text-neutral-400">Navigation</span>
          </div>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="w-full text-left py-2 text-sm text-neutral-300 hover:text-neutral-100 font-medium"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="w-full text-left py-2 text-sm text-neutral-300 hover:text-neutral-100 font-medium"
          >
            Features & Metrics
          </button>
          <button
            onClick={() => scrollToSection('examples')}
            className="w-full text-left py-2 text-sm text-neutral-300 hover:text-neutral-100 font-medium"
          >
            Live Examples
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenHistory();
            }}
            className="w-full text-left py-2 text-sm text-neutral-300 hover:text-neutral-100 font-medium flex items-center justify-between"
          >
            <span>Review History</span>
            <span className="text-xs font-mono bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
              {historyCount} saved
            </span>
          </button>

          {currentView === 'results' && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateHome();
              }}
              className="w-full mt-2 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold text-center block"
            >
              Audit Another Portfolio
            </button>
          )}
        </div>
      )}
    </header>
  );
};
