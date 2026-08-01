// File: tests/unit/utils/catchAsync.test.js

import { describe, it, expect, vi } from 'vitest';
import { catchAsync } from '../../../src/utils/catchAsync.js';

function mockReqResNext() {
  return {
    req: {},
    res: {},
    next: vi.fn(),
  };
}

describe('catchAsync', () => {
  it('calls the wrapped function when it succeeds', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = catchAsync(handler);
    const { req, res, next } = mockReqResNext();

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes errors to next()', async () => {
    const boom = new Error('boom');
    const handler = vi.fn().mockRejectedValue(boom);
    const wrapped = catchAsync(handler);
    const { req, res, next } = mockReqResNext();

    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(boom);
  });
});