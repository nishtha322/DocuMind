// src/middleware/errorHandler.js


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

    ...(config.isProduction ? {} : { stack: err.stack }),
  });
}


export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
