// File: src/utils/catchAsync.js

/**
 * Wrap an async route handler.
 *
 * @param {Function} fn
 * @returns {Function}
 */
export function catchAsync(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}