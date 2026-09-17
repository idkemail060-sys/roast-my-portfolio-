import React, { useState, FormEvent } from 'react';
import { Globe, ArrowRight, AlertCircle, Sparkles, Check, CornerDownLeft } from 'lucide-react';
import { Interactive3DCard, Interactive3DItem } from '../common/Interactive3DCard';

interface UrlSubmissionFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const UrlSubmissionForm: React.FC<UrlSubmissionFormProps> = ({
  onSubmit,
  isLoading,
  disabled = false,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Client-side validation function
  const validateUrl = (rawUrl: string): { isValid: boolean; formattedUrl: string; error?: string } => {
    const trimmed = rawUrl.trim();

    if (!trimmed) {
      return { isValid: false, formattedUrl: '', error: 'Please enter a portfolio website URL.' };
    }

    // Check if protocol is missing and prepend https://
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    try {
      const parsed = new URL(normalized);

      // Enforce http or https protocol
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return {
          isValid: false,
          formattedUrl: '',
          error: 'Only HTTP and HTTPS URLs are supported.',
        };
      }

      // Check for valid hostname with dot or domain
      if (!parsed.hostname || !parsed.hostname.includes('.')) {
        return {
          isValid: false,
          formattedUrl: '',
          error: 'Please enter a complete domain name (e.g., yourname.dev or myportfolio.com).',
        };
      }

      // SSRF & Localhost blocking check (client preview safeguard)
      const host = parsed.hostname.toLowerCase();
      if (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '0.0.0.0' ||
        host === '::1' ||
        host.endsWith('.local') ||
        host.endsWith('.internal') ||
        host.startsWith('192.168.') ||
        host.startsWith('10.') ||
        host.startsWith('172.16.')
      ) {
        return {
          isValid: false,
          formattedUrl: '',
          error: 'Internal, private, and localhost addresses are forbidden for security reasons.',
        };
      }

      return { isValid: true, formattedUrl: normalized };
    } catch {
      return {
        isValid: false,
        formattedUrl: '',
        error: 'Malformed URL. Please check the format and try again.',
      };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
    if (errorMessage) {
      setErrorMessage(null); // Clear error on typing
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { isValid, formattedUrl, error } = validateUrl(urlInput);

    if (!isValid) {
      setErrorMessage(error || 'Invalid URL entered.');
      return;
    }

    setErrorMessage(null);
    onSubmit(formattedUrl);
  };

  const handleQuickFill = (exampleUrl: string) => {
    setUrlInput(exampleUrl);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <Interactive3DCard
          maxTilt={4}
          className="relative flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 p-1.5 rounded-xl border border-neutral-750 bg-neutral-900/90 shadow-[0_15px_35px_rgba(0,0,0,0.6)] focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/30 transition-all duration-200 backdrop-blur-md"
        >
          {/* Input field with icon */}
          <div className="relative flex-1 flex items-center pl-3 sm:pl-4">
            <Globe className="w-5 h-5 text-neutral-400 shrink-0 mr-3" aria-hidden="true" />
            <input
              type="text"
              id="portfolio-url-input"
              value={urlInput}
              onChange={handleInputChange}
              disabled={isLoading || disabled}
              placeholder="https://yourportfolio.dev or alexchen.dev"
              className="w-full bg-transparent text-neutral-100 placeholder-neutral-400 text-sm sm:text-base py-3 focus:outline-none disabled:opacity-50 font-mono tracking-tight"
              autoComplete="url"
              spellCheck="false"
              aria-label="Portfolio website URL"
              aria-invalid={errorMessage ? 'true' : 'false'}
              aria-describedby={errorMessage ? 'url-error-message' : undefined}
            />
            {urlInput.length > 0 && !isLoading && (
              <button
                type="button"
                onClick={() => {
                  setUrlInput('');
                  setErrorMessage(null);
                }}
                className="text-neutral-400 hover:text-neutral-200 px-2.5 py-1 text-xs font-mono rounded hover:bg-neutral-800 transition-colors"
                aria-label="Clear input field"
              >
                Clear
              </button>
            )}
          </div>

          {/* Submit Button */}
          <Interactive3DItem depth={20} className="shrink-0 flex items-stretch">
            <button
              type="submit"
              disabled={isLoading || disabled}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:brightness-110 active:scale-[0.98] text-neutral-950 font-bold text-sm tracking-tight transition-all duration-150 shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              <span>{isLoading ? 'Auditing DOM...' : 'Roast My Portfolio'}</span>
              <ArrowRight className="w-4 h-4 text-neutral-950 stroke-[2.5]" aria-hidden="true" />
            </button>
          </Interactive3DItem>
        </Interactive3DCard>

        {/* Error message area */}
        {errorMessage && (
          <div 
            id="url-error-message"
            role="alert"
            className="mt-3 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200 shadow-md"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <span className="font-semibold font-mono text-[11px] uppercase tracking-wider block text-rose-400">
                Validation Error
              </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
      </form>

      {/* Quick example triggers */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-400 font-mono">
        <span className="text-neutral-400">Quick test portfolios:</span>
        <button
          type="button"
          onClick={() => handleQuickFill('https://alexchen.dev')}
          className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-orange-400 transition-colors"
        >
          alexchen.dev (Senior)
        </button>
        <button
          type="button"
          onClick={() => handleQuickFill('https://sarahkim.design')}
          className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-orange-400 transition-colors"
        >
          sarahkim.design (Design)
        </button>
        <button
          type="button"
          onClick={() => handleQuickFill('https://johndoe-portfolio.vercel.app')}
          className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-orange-400 transition-colors"
        >
          johndoe.vercel.app (Junior)
        </button>
      </div>
    </div>
  );
};
