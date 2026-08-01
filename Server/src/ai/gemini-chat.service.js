// File: src/ai/gemini-chat.service.js

import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

const ai = new GoogleGenAI({
  apiKey: config.gemini.apiKey,

  // Use a custom API endpoint if provided
  ...(process.env.GEMINI_API_BASE_URL
    ? { httpOptions: { baseUrl: process.env.GEMINI_API_BASE_URL } }
    : {}),
});

/**
 * Generate a response from Gemini.
 *
 * @param {string} systemInstruction
 * @param {{ role: 'user'|'model', parts: { text: string }[] }[]} contents
 * @returns {Promise<string>}
 */
export async function generateAnswer(systemInstruction, contents) {
  try {
    const response = await ai.models.generateContent({
      model: config.gemini.chatModel,
      contents,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: config.gemini.thinkingLevel,
        },
      },
    });

    const text = response.text;
    if (!text) {
      // Handle empty responses
      throw new AppError('Gemini returned an empty response', 502);
    }

    return text;
  } catch (err) {
    if (err instanceof AppError) throw err;

    logger.error({ err }, 'Gemini chat completion failed');
    throw new AppError(`Gemini chat request failed: ${err.message}`, 502);
  }
}