// File: src/services/chunking.service.js

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const CHUNK_SIZE = 1000; // Characters per chunk
const CHUNK_OVERLAP = 150; // Shared characters between chunks

/**
 * Split document text into overlapping chunks.
 *
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