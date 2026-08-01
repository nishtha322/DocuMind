// File: src/ai/gemini-embeddings.service.js

import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

const ai = new GoogleGenAI({
  apiKey: config.gemini.apiKey,

  // Use a custom API endpoint if provided
  ...(process.env.GEMINI_API_BASE_URL
    ? { httpOptions: { baseUrl: process.env.GEMINI_API_BASE_URL } }
    : {}),
});

const MAX_CONCURRENT_REQUESTS = 5;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate an embedding with retry support.
 * @param {string} text
 * @param {'RETRIEVAL_DOCUMENT'|'RETRIEVAL_QUERY'} taskType
 * @returns {Promise<number[]>}
 */
async function embedWithRetry(text, taskType) {
  let attempt = 0;

  while (true) {
    try {
      const response = await ai.models.embedContent({
        model: config.gemini.embeddingModel,
        contents: [text],
        config: {
          outputDimensionality: config.gemini.embeddingDimensions,
          taskType,
        },
      });

      return response.embeddings[0].values;
    } catch (err) {
      attempt += 1;

      // Retry only on rate limits or server errors
      const status = err?.status ?? err?.code;
      const isRetryable = status === 429 || (status >= 500 && status < 600);

      if (!isRetryable || attempt > MAX_RETRIES) {
        throw new AppError(`Gemini embedding request failed: ${err.message}`, 502);
      }

      const backoff = INITIAL_BACKOFF_MS * 2 ** (attempt - 1);

      logger.warn(
        { attempt, backoff, status },
        'Gemini embedding request failed, retrying...'
      );

      await sleep(backoff);
    }
  }
}

/**
 * Run async jobs with a concurrency limit.
 * @param {Array<() => Promise<any>>} jobs
 * @param {number} limit
 */
async function runWithConcurrencyLimit(jobs, limit) {
  const results = new Array(jobs.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < jobs.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await jobs[currentIndex]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, jobs.length) }, worker);
  await Promise.all(workers);

  return results;
}

/**
 * Generate embeddings for document chunks.
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function generateDocumentEmbeddings(texts) {
  const jobs = texts.map((text) => () => embedWithRetry(text, 'RETRIEVAL_DOCUMENT'));
  return runWithConcurrencyLimit(jobs, MAX_CONCURRENT_REQUESTS);
}

/**
 * Generate an embedding for a user query.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function generateQueryEmbedding(text) {
  return embedWithRetry(text, 'RETRIEVAL_QUERY');
}