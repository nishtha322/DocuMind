// src/services/chunking.service.js

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const CHUNK_SIZE = 1000; // characters per chunk
const CHUNK_OVERLAP = 150; // characters shared between consecutive chunks

/**
 * Splits raw document text into an array of overlapping chunks.
 * @param {string} text
 * @returns {Promise<string[]>}
 */
export async function chunkText(text) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  return splitter.splitText(text);
}
