import { validateSafeFetchTarget } from '../utils/ssrfGuard';
import { AppError } from '../errors/AppError';

export interface FetchedWebsiteData {
  url: string;
  finalUrl: string;
  domain: string;
  html: string;
  statusCode: number;
  contentType: string;
  responseTimeMs: number;
  contentLength: number;
}

const MAX_RESPONSE_BYTES = 3.5 * 1024 * 1024; // 3.5 MB cap
const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds timeout for scraping target portfolio
const MAX_REDIRECTS = 6;

// High-fidelity standard browser headers to bypass false-positive bot blocks on portfolios
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': BROWSER_USER_AGENT,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"macOS"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

/**
 * Builds a valid DOM shell for Single Page Applications (SPAs) or sites
 * with client-only rendering or anti-bot challenge screens.
 */
function buildFallbackSpaHtml(domain: string, title?: string, note?: string): string {
  const displayTitle = title || `${domain} Portfolio`;
  const detailNote = note || 'Client-rendered web application portfolio.';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${displayTitle}</title>
  </head>
  <body>
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
    <main>
      <h1>${displayTitle}</h1>
      <p>${detailNote}</p>
      <section id="projects">
        <h2>Featured Work</h2>
        <p>Interactive web applications and development showcase.</p>
      </section>
      <section id="contact">
        <h2>Contact</h2>
        <p>Connect via web channels and portfolio showcase.</p>
      </section>
    </main>
    <footer>
      <p>&copy; ${new Date().getFullYear()} ${domain}</p>
    </footer>
  </body>
</html>`;
}

/**
 * Safely fetches a public website's HTML with SSRF validation,
 * automatic HTTP/HTTPS fallback, generous timeouts, and SPA resilience.
 */
export async function fetchWebsiteHtml(initialUrl: string): Promise<FetchedWebsiteData> {
  let currentUrl = initialUrl;
  let redirectsCount = 0;
  const startTime = Date.now();

  // If initial URL had https, prepare fallback to http if TLS fails
  let attemptedHttpFallback = false;

  while (redirectsCount <= MAX_REDIRECTS) {
    // 1. SSRF and DNS verification on the target URL
    const { parsedUrl } = await validateSafeFetchTarget(currentUrl);

    // 2. Setup AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, DEFAULT_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(parsedUrl.toString(), {
        method: 'GET',
        headers: BROWSER_HEADERS,
        redirect: 'manual', // Manually inspect redirects to prevent SSRF redirect bypass
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      // If HTTPS failed due to certificate or SSL handshake error, try HTTP once
      if (
        !attemptedHttpFallback &&
        parsedUrl.protocol === 'https:' &&
        err instanceof Error &&
        (err.message.includes('certificate') ||
          err.message.includes('SSL') ||
          err.message.includes('TLS') ||
          err.message.includes('ECONNRESET') ||
          err.message.includes('fetch failed'))
      ) {
        attemptedHttpFallback = true;
        currentUrl = currentUrl.replace(/^https:/i, 'http:');
        continue;
      }

      if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'))) {
        console.warn(`[WebsiteFetcher] Probe to ${parsedUrl.hostname} timed out after ${DEFAULT_TIMEOUT_MS}ms. Generating latency diagnostic shell.`);
        return {
          url: initialUrl,
          finalUrl: currentUrl,
          domain: parsedUrl.hostname,
          html: buildFallbackSpaHtml(
            parsedUrl.hostname,
            `${parsedUrl.hostname} (Severe Latency / Cold Start)`,
            `Target portfolio server failed to respond within ${Math.round(DEFAULT_TIMEOUT_MS / 1000)} seconds. The portfolio is either running on a sleeping free-tier host (Render/Railway/Glitch) or experiencing high server latency.`
          ),
          statusCode: 408,
          contentType: 'text/html',
          responseTimeMs: DEFAULT_TIMEOUT_MS,
          contentLength: 600,
        };
      }
      const message = err instanceof Error ? err.message : 'Network connection failed';
      throw AppError.badRequest(`Could not connect to ${parsedUrl.hostname}: ${message}`);
    } finally {
      clearTimeout(timeoutId);
    }

    // 3. Handle HTTP Redirects (301, 302, 303, 307, 308)
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) {
        throw AppError.unprocessable(`Website redirected with status ${response.status} but did not provide a Location header.`);
      }

      // Resolve relative redirect locations against current URL
      const nextUrl = new URL(location, currentUrl).toString();
      redirectsCount++;

      if (redirectsCount > MAX_REDIRECTS) {
        throw AppError.badRequest(`Website exceeded maximum allowable redirects (${MAX_REDIRECTS}).`);
      }

      currentUrl = nextUrl;
      continue;
    }

    const responseTimeMs = Date.now() - startTime;

    // 4. Validate HTTP Status
    if (response.status === 404) {
      throw AppError.badRequest(`The portfolio page at "${parsedUrl.toString()}" returned 404 Not Found.`);
    }

    // 5. Read response text safely
    let html = '';
    let receivedBytes = 0;

    try {
      if (response.body) {
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (value) {
            receivedBytes += value.length;
            chunks.push(value);
            if (receivedBytes > MAX_RESPONSE_BYTES) {
              break;
            }
          }
        }

        const totalBuffer = new Uint8Array(receivedBytes);
        let offset = 0;
        for (const chunk of chunks) {
          totalBuffer.set(chunk, offset);
          offset += chunk.length;
        }

        const decoder = new TextDecoder('utf-8', { fatal: false, ignoreBOM: true });
        html = decoder.decode(totalBuffer).trim();
      } else {
        html = await response.text();
        receivedBytes = html.length;
      }
    } catch {
      // If streaming fails, attempt text() fallback
      try {
        html = await response.text();
        receivedBytes = html.length;
      } catch {
        html = '';
      }
    }

    // 6. Resilient handling for HTTP 403/401/503 (Anti-Bot / Cloudflare Challenge / Protected site)
    // Instead of failing the entire user workflow, proceed with the returned HTML
    // or build a diagnostic shell that lets Gemini roast their anti-bot defense!
    if (response.status === 403 || response.status === 401 || response.status === 503) {
      if (!html || html.length < 50) {
        html = buildFallbackSpaHtml(
          parsedUrl.hostname,
          `${parsedUrl.hostname} (Anti-Bot Shield Active)`,
          `Target returned HTTP ${response.status}. The portfolio has strict WAF / anti-bot challenge active.`
        );
      }
    }

    // 7. Resilient handling for empty or minimal SPAs (React / Vue / Next.js client rendered)
    if (!html || html.length < 30) {
      html = buildFallbackSpaHtml(parsedUrl.hostname);
    }

    const contentType = (response.headers.get('content-type') || 'text/html').toLowerCase();

    return {
      url: initialUrl,
      finalUrl: currentUrl,
      domain: parsedUrl.hostname,
      html,
      statusCode: response.status,
      contentType: contentType || 'text/html',
      responseTimeMs: Math.max(1, responseTimeMs),
      contentLength: receivedBytes || html.length,
    };
  }

  throw AppError.badRequest(`Too many redirects while attempting to fetch "${initialUrl}".`);
}
