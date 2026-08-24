import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError';
import { ApiResponse } from '../shared/utils/response';
import { logger } from '../config/logger';
import { config } from '../config/environment';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || undefined;

  // Log error details
  if (statusCode >= 500) {
    logger.error('Unhandled Server Error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
    });
  } else {
    logger.warn('Client Request Error', {
      statusCode,
      message,
      path: req.path,
      method: req.method,
    });
  }

  // Handle Syntax Error in JSON Body
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON syntax in request body';
  }

  // Obscure internal error messages in production
  if (config.isProduction && statusCode === 500 && !(err instanceof AppError)) {
    message = 'An unexpected internal error occurred';
    errors = undefined;
  }

  ApiResponse.error(res, message, statusCode, errors);
};
