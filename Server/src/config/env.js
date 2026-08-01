// File: src/config/env.js

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Required environment variables
const requiredEnvVars = ['PORT', 'DATABASE_URL', 'GEMINI_API_KEY'];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        `Check your .env file against .env.example.`
    );
  }
}

validateEnv();

export const config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  databaseUrl: process.env.DATABASE_URL,

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
    embeddingDimensions:
      Number(process.env.GEMINI_EMBEDDING_DIMENSIONS) || 768,
    chatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-3.6-flash',
    thinkingLevel: process.env.GEMINI_THINKING_LEVEL || 'LOW',
  },

  chroma: {
    host: process.env.CHROMA_HOST || 'localhost',
    port: Number(process.env.CHROMA_PORT) || 8000,
    collectionName:
      process.env.CHROMA_COLLECTION_NAME || 'document_chunks',
  },
};