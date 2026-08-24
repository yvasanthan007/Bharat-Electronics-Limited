import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../shared/errors/AppError';

interface RequestValidationSchema {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export const validateRequest = (schema: RequestValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        return next(new ValidationError('Request validation failed', formattedErrors));
      }
      return next(error);
    }
  };
};
