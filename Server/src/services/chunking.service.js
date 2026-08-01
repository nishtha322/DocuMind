// src/services/chunking.service.js
//
// WHY CHUNKING IS NECESSARY AT ALL:
// LLMs (and the embedding models used for retrieval) have limited context
// windows, and — more importantly for RAG — retrieval works best over
// small, semantically focused pieces of text. If we embedded an entire
// 20-page PDF as ONE vector, a question about page 15 would get diluted
// by everything else in the document, and similarity search would be far
// less precise. Splitting into overlapping chunks lets us retrieve just
// the few chunks actually relevant to a question.
//
// WHY LangChain's RecursiveCharacterTextSplitter (not a naive fixed-size
// slice, not a custom regex splitter):
// A naive "every 500 characters" splitter can cut a sentence — or even a
// word — in half, which hurts both embedding quality and readability.
// RecursiveCharacterTextSplitter tries a hierarchy of separators
// (paragraph breaks -> line breaks -> sentences -> words) and only falls
// back to a hard character cut as a last resort, producing chunks that
// respect natural text boundaries wherever possible.
//
// WHY OVERLAP BETWEEN CHUNKS:
// If a key idea spans the boundary between chunk N and chunk N+1 with NO
// overlap, retrieval might fetch chunk N but miss the sentence that
// finishes the thought in chunk N+1. A modest overlap (chunkOverlap below)
// duplicates a little text at each boundary so context isn't lost.
//
// WHY THESE SPECIFIC NUMBERS (1000 / 150):
// This is a well-established starting point for RAG over general prose:
// large enough that each chunk carries real semantic meaning (helps
// retrieval), small enough to keep prompts (Module 5) affordable and
// focused. These are tunable — the exact right numbers depend on the
// embedding model and document type, which we can revisit empirically
// once we're evaluating real retrieval quality in Module 5.

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
