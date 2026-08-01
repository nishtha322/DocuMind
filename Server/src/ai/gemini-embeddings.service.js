// src/ai/gemini-embeddings.service.js


import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

const ai = new GoogleGenAI({
  apiKey: config.gemini.apiKey,
  
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
 * Calls Gemini's embedContent for a single text, retrying transient
 * failures with exponential backoff.
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
 * Runs an array of async jobs with a fixed concurrency limit, preserving
 * result order. A minimal hand-rolled pool — no extra dependency needed for
 * this project's scale.
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
 * Generates embeddings for multiple document chunks (used at ingestion time).
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function generateDocumentEmbeddings(texts) {
  const jobs = texts.map((text) => () => embedWithRetry(text, 'RETRIEVAL_DOCUMENT'));
  return runWithConcurrencyLimit(jobs, MAX_CONCURRENT_REQUESTS);
}

/**
 * Generates an embedding for a single user query (used at retrieval time).
 * Uses taskType RETRIEVAL_QUERY, which is optimized differently from
 * RETRIEVAL_DOCUMENT for asymmetric search (short question -> long passages).
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function generateQueryEmbedding(text) {
  return embedWithRetry(text, 'RETRIEVAL_QUERY');
}
