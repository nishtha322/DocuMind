// src/middleware/errorHandler.js
//
// WHY CENTRALIZED ERROR HANDLING:
// Without this, every controller would need its own try/catch that
// manually formats an error response — repetitive and inconsistent.
// Instead: controllers just `throw` (or call `next(err)`), and this single
// middleware (registered LAST in app.js, after all routes) catches
// everything and formats one consistent JSON error shape.
//
// Express recognizes an error-handling middleware by its 4 arguments
// (err, req, res, next) — that signature is what tells Express "route
// errors here" instead of treating it as a normal middleware.

import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  if (isOperational) {
    // Expected error (e.g. validation failure, not-found) — log at warn level.
    logger.warn({ err, path: req.path }, err.message);
  } else {
    // Unexpected bug — log full detail at error level so we can debug it.
    logger.error({ err, path: req.path }, 'Unexpected error');
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : 'Internal Server Error',
    // Only leak stack traces in non-production, and only for real bugs —
    // never send internals to clients in production.
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
}

// Catches requests to routes that don't exist (404).
// Registered right before errorHandler, after all real routes.
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
