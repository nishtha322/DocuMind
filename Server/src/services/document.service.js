// src/services/document.service.js
//
// WHY A SERVICE LAYER (even though it started out thin):
// Controllers should NEVER call repositories directly. This file now
// orchestrates the FULL RAG ingestion pipeline (file already saved by
// multer -> DB record -> PDF text extraction -> chunking -> embeddings ->
// vector storage) and the controller hasn't changed since Module 3. It
// still just calls the service.
//
// This is the DEFAULT_USER_ID placeholder mentioned in the migration —
// real auth (extracting the user from a JWT/session) is a future module.

import * as documentRepository from '../repositories/document.repository.js';
import * as chunkRepository from '../repositories/chunk.repository.js';
import { extractTextFromPdf } from './pdf-parser.service.js';
import { chunkText } from './chunking.service.js';
import { generateDocumentEmbeddings } from '../ai/gemini-embeddings.service.js';
import { storeChunkEmbeddings, deleteDocumentVectors } from '../vector-store/chroma.service.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function createDocument({ originalFilename, storagePath }) {
  if (!originalFilename || !storagePath) {
    throw new AppError('originalFilename and storagePath are required', 400);
  }
  return documentRepository.createDocument({
    userId: DEFAULT_USER_ID,
    originalFilename,
    storagePath,
  });
}

/**
 * The full RAG ingestion pipeline: takes a file already saved to disk by
 * the upload middleware, creates its DB record, extracts text, chunks it,
 * generates embeddings for every chunk via Gemini, and stores those vectors
 * in ChromaDB — moving the document's `status` through each stage so a
 * client can poll progress (uploaded -> parsing -> embedding -> ready, or
 * -> failed at any point).
 *
 * @param {{ originalname: string, path: string }} file - multer's file object
 * @returns {Promise<object>} the final document row
 */
export async function uploadAndProcessDocument(file) {
  const document = await documentRepository.createDocument({
    userId: DEFAULT_USER_ID,
    originalFilename: file.originalname,
    storagePath: file.path,
  });

  try {
    await documentRepository.updateDocumentStatus(document.id, 'parsing');
    const { text, pageCount } = await extractTextFromPdf(file.path);

    const chunkTexts = await chunkText(text);
    const chunks = await chunkRepository.insertChunks(document.id, chunkTexts);

    await documentRepository.updateDocumentStatus(document.id, 'embedding', { pageCount });

    // Embeddings are generated in the SAME order as `chunks`, so index i of
    // `embeddings` corresponds to index i of `chunks` — storeChunkEmbeddings
    // relies on this pairing.
    const embeddings = await generateDocumentEmbeddings(chunks.map((c) => c.content));
    await storeChunkEmbeddings(document.id, chunks, embeddings);
    await chunkRepository.markChunksEmbedded(chunks.map((c) => c.id));

    logger.info(
      { documentId: document.id, pageCount, chunkCount: chunks.length },
      'Document parsed, chunked, and embedded successfully'
    );

    return documentRepository.updateDocumentStatus(document.id, 'ready');
  } catch (err) {
   
    const message = err instanceof AppError ? err.message : 'Failed to process document';
    await documentRepository.updateDocumentStatus(document.id, 'failed', { errorMessage: message });
    throw err;
  }
}

export async function getDocumentById(id) {
  const document = await documentRepository.findDocumentById(id);
  if (!document) {
    throw new AppError(`Document not found: ${id}`, 404);
  }
  return document;
}

export async function listDocuments() {
  return documentRepository.findDocumentsByUser(DEFAULT_USER_ID);
}

export async function removeDocument(id) {
  // Delete vectors FIRST, while we still know the document exists — if we
  // deleted the Postgres row first and this failed, we'd be left with
  // orphaned vectors in Chroma with no way to find them again.
  await deleteDocumentVectors(id);
  const deleted = await documentRepository.deleteDocument(id);
  if (!deleted) {
    throw new AppError(`Document not found: ${id}`, 404);
  }
}
