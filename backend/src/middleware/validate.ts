import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny | { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if ('parseAsync' in schema && typeof schema.parseAsync === 'function') {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
      } else {
        const schemaObj = schema as { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny };
        if (schemaObj.body) await schemaObj.body.parseAsync(req.body);
        if (schemaObj.query) await schemaObj.query.parseAsync(req.query);
        if (schemaObj.params) await schemaObj.params.parseAsync(req.params);
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const validateRequest = validate;
