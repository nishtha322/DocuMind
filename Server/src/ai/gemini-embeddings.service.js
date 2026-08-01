// src/ai/gemini-embeddings.service.js
//
// WHY @google/genai AND NOT @langchain/google-genai's embeddings wrapper:
// LangChain's `GoogleGenerativeAIEmbeddings` is built on `@google/generative-ai`,
// which Google has deprecated in favor of a single unified SDK, `@google/genai`.
// Building new code on a deprecated SDK is a real interview red flag, so this
// project calls Gemini directly through the current official SDK instead.
// LangChain is still used elsewhere in this project (chunking — see
// chunking.service.js — and the RAG chain in Module 5) where its abstractions
// add genuine value; it's not used here simply to "use LangChain everywhere".
// Knowing WHEN to reach for a framework vs. the underlying SDK is exactly the
// kind of judgment call worth explaining in an interview.
//
// WHY OUR OWN CONCURRENCY-LIMITED BATCHING (not one giant call, not a naive
// unlimited Promise.all):
// - One call per chunk in an unbounded Promise.all could fire 100+
//   simultaneous requests for a large PDF — a fast way to get rate-limited
//   (HTTP 429) or overwhelm the API quota.
// - A single call bundling ALL chunks avoids that, but current Gemini
//   embedding models can be picky about how many inputs one request accepts,
//   and one giant request means one failure loses everything.
// - Instead: process chunks with a small, fixed concurrency (a simple pool)
//   and retry transient failures (429/5xx) with exponential backoff. This is
//   the standard resilient pattern for calling any external AI API at scale,
//   and it's a great thing to be able to explain in an interview.

import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

const ai = new GoogleGenAI({
  apiKey: config.gemini.apiKey,
  // GEMINI_API_BASE_URL is intentionally undocumented in .env.example — it
  // exists only so this service can be pointed at a local mock server
  // during development/testing without touching real Gemini quota.
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
      // Only retry on errors that are likely transient (rate limits, server
      // errors). A malformed request (4xx other than 429) will just fail the
      // same way again, so don't waste retries on it.
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
