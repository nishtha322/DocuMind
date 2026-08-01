// src/config/env.js
//
// WHY THIS FILE EXISTS:
// Every other file in the app should import config from HERE, never call
// `process.env.X` directly. That gives us one single source of truth for
// configuration, and lets us validate everything at startup instead of
// discovering a missing env var when a request happens to hit that code path
// in production at 2am.

import dotenv from 'dotenv';

// Load variables from .env into process.env (only affects local/dev;
// in real production you'd usually inject env vars via the platform instead
// of a .env file, but dotenv.config() is a harmless no-op if .env is absent).
dotenv.config();

// List every env var this app currently requires.
// As we add modules (Postgres, Gemini, ChromaDB...), we will extend this list.
const requiredEnvVars = ['PORT', 'DATABASE_URL', 'GEMINI_API_KEY'];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    // Fail fast and loud. Better to crash at startup with a clear message
    // than to run in a half-configured state.
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        `Check your .env file against .env.example.`
    );
  }
}

validateEnv();

// Export a single, typed-ish config object. Anything reading config
// should destructure from here.
export const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL,
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
    // 768 is Google's recommended "good quality, lower storage cost" tier
    // (the model supports up to 3072 via Matryoshka Representation Learning).
    embeddingDimensions: Number(process.env.GEMINI_EMBEDDING_DIMENSIONS) || 768,
  },
  chroma: {
    host: process.env.CHROMA_HOST || 'localhost',
    port: Number(process.env.CHROMA_PORT) || 8000,
    collectionName: process.env.CHROMA_COLLECTION_NAME || 'document_chunks',
  },
};
