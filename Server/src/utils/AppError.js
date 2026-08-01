// File: src/utils/AppError.js

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true; // Expected application error

    // Keep the stack trace clean
    Error.captureStackTrace(this, this.constructor);
  }
}