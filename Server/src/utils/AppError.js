// src/utils/AppError.js


export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks this as an "expected" error

   
    Error.captureStackTrace(this, this.constructor);
  }
}
