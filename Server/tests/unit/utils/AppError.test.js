// File: tests/unit/utils/AppError.test.js

import { describe, it, expect } from 'vitest';
import { AppError } from '../../../src/utils/AppError.js';

describe('AppError', () => {
  it('sets the message, status code, and operational flag', () => {
    const err = new AppError('Not found', 404);

    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
  });

  it('uses 500 as the default status code', () => {
    const err = new AppError('Something broke');

    expect(err.statusCode).toBe(500);
  });

  it('extends the built-in Error class', () => {
    const err = new AppError('test', 400);

    expect(err).toBeInstanceOf(Error);
    expect(err.stack).toBeDefined();
  });
});