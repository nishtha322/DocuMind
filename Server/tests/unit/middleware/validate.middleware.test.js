// File: tests/unit/middleware/validate.middleware.test.js

import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '../../../src/middleware/validate.middleware.js';
import { AppError } from '../../../src/utils/AppError.js';

const schema = z.object({
  question: z.string().min(1, 'is required'),
});

describe('validate middleware', () => {
  it('calls next() and updates req.body on valid input', () => {
    const middleware = validate(schema, 'body');
    const req = { body: { question: 'hello', extraField: 'stripped by zod' } };
    const next = vi.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ question: 'hello' });
  });

  it('calls next(AppError) for invalid input', () => {
    const middleware = validate(schema, 'body');
    const req = { body: { question: '' } };
    const next = vi.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);

    const errorArg = next.mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(AppError);
    expect(errorArg.statusCode).toBe(400);
    expect(errorArg.message).toContain('question');
  });

  it('validates route parameters', () => {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const middleware = validate(paramsSchema, 'params');
    const req = { params: { id: 'not-a-uuid' } };
    const next = vi.fn();

    middleware(req, {}, next);

    const errorArg = next.mock.calls[0][0];
    expect(errorArg.statusCode).toBe(400);
  });
});