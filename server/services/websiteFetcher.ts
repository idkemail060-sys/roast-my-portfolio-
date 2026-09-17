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

const MAX_RESPONSE_BYTES = 2.5 * 1024 * 1024; // 2.5 MB cap to prevent memory bloat/zip bombs
const DEFAULT_TIMEOUT_MS = 9000; // 9 seconds fetch timeout
const MAX_REDIRECTS = 5;

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (RoastMyPortfolio Audit Bot/1.0; +https://roastmyportfolio.dev)';

/**
 * Safely fetches a public website's HTML with SSRF validation on every redirect hop,
 * timeout enforcement, size limits, and Content-Type inspection.
 */
export async function fetchWebsiteHtml(initialUrl: string): Promise<FetchedWebsiteData> {
  let currentUrl = initialUrl;
  let redirectsCount = 0;
  const startTime = Date.now();

  while (redirectsCount <= MAX_REDIRECTS) {
    // 1. SSRF and DNS check on the target URL
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
        headers: {
          'User-Agent': BROWSER_USER_AGENT,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
        },
        redirect: 'manual', // Manually inspect redirects to prevent SSRF redirect bypass
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'))) {
        throw AppError.timeout(
          `Request timed out after ${DEFAULT_TIMEOUT_MS}ms while trying to reach ${parsedUrl.hostname}. The website took too long to respond.`
        );
      }
      const message = err instanceof Error ? err.message : 'Network connection failed';
      throw AppError.badRequest(`Could not connect to ${parsedUrl.hostname}: ${message}`);
    } finally {
      clearTimeout(timeoutId);
    }

    // 3. Handle HTTP Redirects (301, 302, 307, 308)
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
    if (response.status >= 400) {
      if (response.status === 404) {
        throw AppError.badRequest(`The portfolio page at "${parsedUrl.toString()}" returned 404 Not Found.`);
      }
      if (response.status === 403 || response.status === 401) {
        throw AppError.badRequest(
          `Access to "${parsedUrl.toString()}" was restricted or blocked (HTTP ${response.status}). The site may have anti-bot protections active.`
        );
      }
      throw AppError.badRequest(`Target portfolio website returned error status code HTTP ${response.status}.`);
    }

    // 5. Validate Content-Type (Only HTML or XHTML allowed)
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const isHtml =
      contentType.includes('text/html') ||
      contentType.includes('application/xhtml+xml') ||
      contentType.includes('text/plain'); // Some developer sites serve plaintext index

    if (!isHtml && contentType.length > 0) {
      throw AppError.badRequest(
        `Unsupported content type "${contentType}". The provided URL does not appear to point to an HTML webpage (e.g. PDF, image, or binary).`
      );
    }

    // 6. Check declared Content-Length header
    const declaredLength = parseInt(response.headers.get('content-length') || '0', 10);
    if (declaredLength > MAX_RESPONSE_BYTES) {
      throw AppError.badRequest(
        `The webpage payload size (${(declaredLength / 1024 / 1024).toFixed(1)}MB) exceeds the maximum allowed limit of 2.5MB.`
      );
    }

    // 7. Stream reading with payload size cap
    if (!response.body) {
      throw AppError.unprocessable('Received empty response body from website.');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        receivedBytes += value.length;
        if (receivedBytes > MAX_RESPONSE_BYTES) {
          // Truncate stream safely
          chunks.push(value);
          break;
        }
        chunks.push(value);
      }
    }

    // Decode HTML text
    const totalBuffer = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
      totalBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    const decoder = new TextDecoder('utf-8');
    const html = decoder.decode(totalBuffer).trim();

    // 8. Validate non-empty content
    if (!html || html.length < 20) {
      throw AppError.unprocessable(
        `The webpage returned empty or minimal HTML content (${html.length} bytes). Make sure the portfolio is publicly accessible and not behind client-only authentication.`
      );
    }

    return {
      url: initialUrl,
      finalUrl: currentUrl,
      domain: parsedUrl.hostname,
      html,
      statusCode: response.status,
      contentType: contentType || 'text/html',
      responseTimeMs,
      contentLength: receivedBytes,
    };
  }

  throw AppError.badRequest(`Too many redirects while attempting to fetch "${initialUrl}".`);
}
