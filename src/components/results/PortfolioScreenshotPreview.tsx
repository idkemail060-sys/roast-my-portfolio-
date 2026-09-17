import React, { useState } from 'react';
import { 
  Laptop, 
  Smartphone, 
  ExternalLink, 
  Maximize2, 
  RefreshCw, 
  ShieldCheck, 
  Eye, 
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Interactive3DCard, Interactive3DItem } from '../common/Interactive3DCard';

interface PortfolioScreenshotPreviewProps {
  url: string;
  domain: string;
}

export const PortfolioScreenshotPreview: React.FC<PortfolioScreenshotPreviewProps> = ({
  url,
  domain,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Generate screenshot URLs with reliable public screenshot services
  const desktopScreenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=1280&v=${refreshKey}`;
  const mobileScreenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=480&v=${refreshKey}`;

  const currentScreenshotUrl = deviceMode === 'desktop' ? desktopScreenshotUrl : mobileScreenshotUrl;

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Interactive3DCard
      maxTilt={3}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-xl overflow-hidden backdrop-blur-md"
    >
      {/* Top Browser Control Bar */}
      <div className="border-b border-neutral-800 px-4 py-3 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mac window traffic dots */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/50" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/50" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              <span>Live Visual Snapshot</span>
            </span>
          </div>
        </div>

        {/* Viewport Toggles & Actions */}
        <div className="flex items-center gap-2">
          {/* Device Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono">
            <button
              onClick={() => { setDeviceMode('desktop'); setIsLoading(true); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                deviceMode === 'desktop'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Desktop 1280px Preview"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => { setDeviceMode('mobile'); setIsLoading(true); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                deviceMode === 'mobile'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Mobile 480px Preview"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Refresh Snapshot */}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Refresh snapshot"
            aria-label="Refresh snapshot"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          {/* Fullscreen Modal Toggle */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Expand Full Viewport"
            aria-label="Expand Full Viewport"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Live External Link */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-neutral-100 hover:border-neutral-700 text-xs font-mono transition-colors"
          >
            <span>Visit Live</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Simulated Address Bar */}
      <div className="bg-neutral-950/90 border-b border-neutral-850 px-4 py-2 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900/90 border border-neutral-800 text-xs font-mono text-neutral-400 truncate">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-emerald-400 font-semibold">https://</span>
          <span className="text-neutral-200 font-medium truncate">{url.replace(/^https?:\/\//, '')}</span>
        </div>
        <span className="text-[10px] font-mono text-neutral-500 uppercase px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 shrink-0">
          {deviceMode === 'desktop' ? '1280 × 800' : '480 × 800'}
        </span>
      </div>

      {/* Viewport Render Stage */}
      <div className="relative bg-neutral-950 p-4 sm:p-6 flex items-center justify-center min-h-[300px] sm:min-h-[420px] overflow-hidden">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/90 z-10 space-y-3">
            <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
            <div className="text-center font-mono space-y-1">
              <span className="text-xs text-orange-300 font-semibold block">
                RENDERING PORTFOLIO SNAPSHOT
              </span>
              <span className="text-[11px] text-neutral-500">
                Capturing responsive DOM state for {domain}...
              </span>
            </div>
          </div>
        )}

        {/* Error / Fallback Card */}
        {hasError ? (
          <div className="text-center py-12 px-4 max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
              <Layers className="w-6 h-6 text-orange-400" />
            </div>
            <h4 className="text-sm font-mono font-bold text-neutral-200">
              Live Preview Available Directly
            </h4>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Target site blocks external headless scrapers via strict CSP or iframe security headers. You can open the live portfolio in a dedicated tab.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-neutral-950 font-bold text-xs font-mono transition-colors shadow-md"
            >
              <span>Launch {domain} in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          /* Actual Screenshot Image */
          <motion.div
            key={`${deviceMode}-${refreshKey}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`transition-all duration-300 ${
              deviceMode === 'desktop'
                ? 'w-full max-w-4xl aspect-[16/10] rounded-lg shadow-2xl overflow-hidden border border-neutral-800 bg-neutral-900'
                : 'w-[320px] sm:w-[360px] aspect-[9/16] rounded-2xl shadow-2xl overflow-hidden border-4 border-neutral-800 bg-neutral-900'
            }`}
          >
            <img
              src={currentScreenshotUrl}
              alt={`Live screenshot preview of ${domain}`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className="w-full h-full object-cover object-top hover:object-bottom transition-all duration-5000 ease-in-out cursor-pointer"
              onClick={() => setIsFullscreen(true)}
              title="Click to expand high-resolution preview"
            />
          </motion.div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2.5 bg-neutral-950/70 border-t border-neutral-850 flex items-center justify-between text-[11px] font-mono text-neutral-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Real render snapshot synchronized with DOM inspection</span>
        </span>
        <button
          onClick={() => setIsFullscreen(true)}
          className="text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
        >
          <span>Expand Viewport</span>
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>

      {/* High-Resolution Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-neutral-950/90 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsFullscreen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="High-Resolution Portfolio Screenshot"
          >
            <div 
              className="relative w-full max-w-6xl max-h-[90vh] rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-mono text-neutral-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">{domain}</span>
                  <span className="text-neutral-500 font-normal hidden sm:inline">— High Resolution Preview</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-neutral-100 text-xs font-mono"
                  >
                    <span>Open Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Image Area */}
              <div className="overflow-auto max-h-[calc(90vh-60px)] p-4 bg-neutral-950 flex justify-center">
                <img
                  src={desktopScreenshotUrl}
                  alt={`Full preview of ${domain}`}
                  className="rounded-lg border border-neutral-800 max-w-full h-auto shadow-2xl"
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </Interactive3DCard>
  );
};
