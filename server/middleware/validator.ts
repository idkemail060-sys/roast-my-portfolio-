import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

// SSRF prevention: Match private IPv4 addresses (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, 127.0.0.0/8)
const PRIVATE_IP_REGEX = /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|0\.0\.0\.0)/;

// Internal domain patterns
const INTERNAL_HOST_REGEX = /^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.lan|.*\.corp|.*\.arpa)$/i;

export interface ValidatedReviewRequest extends Request {
  validatedUrl?: string;
  validatedDomain?: string;
}

export function validateReviewUrl(req: ValidatedReviewRequest, res: Response, next: NextFunction) {
  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return next(AppError.badRequest('A valid portfolio "url" string is required in the request body.'));
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return next(AppError.badRequest('Portfolio URL cannot be empty.'));
  }

  if (trimmed.length > 2048) {
    return next(AppError.badRequest('Portfolio URL exceeds maximum length of 2048 characters.'));
  }

  // Check if string already contains a URI scheme (e.g., http://, ftp://, file://)
  // If no scheme is present, default to https:// for user convenience
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  const formattedUrl = hasScheme ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(formattedUrl);
  } catch {
    return next(AppError.badRequest('Invalid URL format. Please provide a valid web address.'));
  }

  // Requirement 8: Only allow HTTP and HTTPS URLs
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return next(AppError.badRequest(`Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS URLs are allowed.`));
  }

  const hostname = parsed.hostname.toLowerCase();

  // Guard against loopback & private subnets (SSRF prevention)
  if (
    hostname === 'localhost' ||
    hostname === '::1' ||
    INTERNAL_HOST_REGEX.test(hostname) ||
    PRIVATE_IP_REGEX.test(hostname)
  ) {
    return next(
      AppError.badRequest(
        'Private IP addresses, loopback hosts (localhost/127.0.0.1), and internal domains are not permitted for security reasons.'
      )
    );
  }

  // Domain structure check - must contain a dot or valid TLD
  if (!hostname.includes('.')) {
    return next(AppError.badRequest('Invalid target hostname. Hostname must be a fully qualified public domain (e.g., alexchen.dev).'));
  }

  // Normalization: clean trailing slashes if just root, keep sanitized URL
  req.validatedUrl = parsed.toString();
  req.validatedDomain = hostname;
  req.body.url = req.validatedUrl;

  next();
}

export function validateReviewIdParam(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return next(AppError.badRequest('A valid review "id" parameter is required in the path.'));
  }

  if (id.length > 128) {
    return next(AppError.badRequest('Review ID exceeds maximum length.'));
  }

  next();
}
