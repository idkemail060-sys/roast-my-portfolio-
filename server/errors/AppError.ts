export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static unprocessable(message: string, details?: unknown) {
    return new AppError(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static timeout(message = 'Request timed out processing portfolio audit') {
    return new AppError(message, 408, 'REQUEST_TIMEOUT');
  }

  static internal(message = 'An internal server error occurred') {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}
