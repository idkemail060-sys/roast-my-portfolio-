import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export function requestTimeout(timeoutMs = config.requestTimeoutMs) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: {
            message: `Request timed out after ${timeoutMs}ms. The target website may be unresponsive or taking too long.`,
            code: 'REQUEST_TIMEOUT',
          },
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timer);
    });

    res.on('close', () => {
      clearTimeout(timer);
    });

    next();
  };
}
