import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import type { ApiResponse } from '../types/index.js';

export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: Error & { statusCode?: number; errors?: Record<string, string[]> },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;

  if (statusCode === 500) {
    logger.error('Unhandled error', {
      message: err.message,
      stack: process.env['NODE_ENV'] !== 'production' ? err.stack : undefined,
      method: req.method,
      path: req.path,
    });
  }

  const isProd = process.env['NODE_ENV'] === 'production';
  const response: ApiResponse = {
    success: false,
    message: isProd && statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message,
    errors: err.errors,
  };

  res.status(statusCode).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  };
  res.status(404).json(response);
}
