import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export function requestTimeout(defaultTimeoutMs = config.requestTimeoutMs) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Portfolio audit involves live web scraping and multi-modal AI generation.
    // Allocate 75 seconds for POST /api/reviews so slow external sites never trigger premature 408s.
    const isAuditPost = req.method === 'POST' && (req.originalUrl?.includes('/api/reviews') || req.url === '/');
    const effectiveTimeoutMs = isAuditPost ? Math.max(75000, defaultTimeoutMs) : defaultTimeoutMs;

    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: {
            message: `Request timed out after ${effectiveTimeoutMs}ms. The target website may be unresponsive or taking too long.`,
            code: 'REQUEST_TIMEOUT',
          },
        });
      }
    }, effectiveTimeoutMs);

    res.on('finish', () => {
      clearTimeout(timer);
    });

    res.on('close', () => {
      clearTimeout(timer);
    });

    next();
  };
}
