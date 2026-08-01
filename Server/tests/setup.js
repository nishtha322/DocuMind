// File: tests/setup.js

// Set test environment variables
process.env.PORT = process.env.PORT || '5000';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || 'test-key-not-used';