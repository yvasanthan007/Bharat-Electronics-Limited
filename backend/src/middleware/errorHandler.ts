import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error processing request ${req.method} ${req.url}:`, {
    error: err.message,
    stack: err.stack,
  });

  if (err instanceof ZodError) {
    return res.status(400).json(errorResponse('Validation Error', err.issues));
  }

  // Handle specific known errors (like Prisma issues, etc)
  if (err.statusCode) {
    return res.status(err.statusCode).json(errorResponse(err.message));
  }

  // Fallback to 500
  return res
    .status(500)
    .json(errorResponse('Internal Server Error'));
};
