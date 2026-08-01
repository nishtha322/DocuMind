// src/middleware/validate.middleware.js


import { AppError } from '../utils/AppError.js';

/**
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'params'|'query'} source - which part of the request to validate
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
  
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.') || source}: ${issue.message}`)
        .join('; ');
      return next(new AppError(`Validation failed — ${message}`, 400));
    }


    req[source] = result.data;
    next();
  };
}
