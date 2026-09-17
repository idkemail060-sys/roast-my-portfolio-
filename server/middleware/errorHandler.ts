import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { config } from '../config/env';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Handle SyntaxError for bad JSON body parsing
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Malformed JSON payload in request body',
        code: 'INVALID_JSON',
      },
    });
  }

  // Log unexpected errors securely without leaking to client
  console.error('[ServerError]', {
    message: err.message,
    stack: config.isProduction ? undefined : err.stack,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  return res.status(500).json({
    success: false,
    error: {
      message: 'An unexpected error occurred while processing your request. Please try again.',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
}
