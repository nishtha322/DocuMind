// File: src/middleware/validate.middleware.js

import { AppError } from '../utils/AppError.js';

/**
 * Validate request data against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'params'|'query'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Format validation errors into a single message
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.') || source}: ${issue.message}`)
        .join('; ');

      return next(new AppError(`Validation failed - ${message}`, 400));
    }

    // Use the validated data
    req[source] = result.data;
    next();
  };
}