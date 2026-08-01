// src/ai/gemini-chat.service.js
//
// WHY gemini-3.6-flash, AND WHY NO temperature/top_p/top_k HERE:
// As of this model generation, Google has deprecated the classic sampling
// parameters (temperature/top_p/top_k) — they're silently ignored today
// and documented to start returning HTTP 400 in future model generations.
// Deliberately NOT setting them here (rather than setting temperature: 0
// out of old habit) avoids code that looks like it's controlling
// determinism but silently isn't — and avoids a future breaking change
// when Google starts rejecting the request outright. The replacement
// control is `thinkingConfig.thinkingLevel`, which we DO set (see
// config/env.js for why 'LOW' is our default for this workload).
//
// WHY system_instruction IS SEPARATE FROM THE PROMPT STRING:
// Passed via config.systemInstruction rather than concatenated into the
// user message — this is the officially supported way to give the model
// stable behavioral rules that take priority over the per-request content,
// and it keeps prompts/rag-answer.prompt.js focused purely on the
// per-request context + question.

import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

const ai = new GoogleGenAI({
  apiKey: config.gemini.apiKey,
  // See gemini-embeddings.service.js for why this override exists —
  // same reasoning applies here (local testing against a mock server).
  ...(process.env.GEMINI_API_BASE_URL
    ? { httpOptions: { baseUrl: process.env.GEMINI_API_BASE_URL } }
    : {}),
});

/**
 * Sends a single-turn generation request to Gemini and returns the answer text.
 * @param {string} systemInstruction
 * @param {string} userPrompt
 * @returns {Promise<string>}
 */
export async function generateAnswer(systemInstruction, userPrompt) {
  try {
    const response = await ai.models.generateContent({
      model: config.gemini.chatModel,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: config.gemini.thinkingLevel,
        },
      },
    });

    const text = response.text;
    if (!text) {
      // Can happen if the response was blocked by safety filters, or the
      // model returned only a function call / empty candidate.
      throw new AppError('Gemini returned an empty response', 502);
    }
    return text;
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error({ err }, 'Gemini chat completion failed');
    throw new AppError(`Gemini chat request failed: ${err.message}`, 502);
  }
}
