// src/services/document.service.js
//
// WHY A SERVICE LAYER (even though it started out thin):
// Controllers should NEVER call repositories directly. Module 3 is the
// proof of why: `uploadAndProcessDocument` below now orchestrates FOUR
// different concerns (file already saved by multer, DB record creation,
// PDF text extraction, chunking + persisting chunks) — and the controller
// didn't have to change AT ALL to support that. It still just calls the
// service.
//
// This is the DEFAULT_USER_ID placeholder mentioned in the migration —
// real auth (extracting the user from a JWT/session) is a future module.

import * as documentRepository from '../repositories/document.repository.js';
import * as chunkRepository from '../repositories/chunk.repository.js';
import { extractTextFromPdf } from './pdf-parser.service.js';
import { chunkText } from './chunking.service.js';
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
 * The real upload pipeline: takes a file already saved to disk by the
 * upload middleware, creates its DB record, extracts text, chunks it,
 * and persists the chunks — moving the document's `status` through the
 * pipeline at each stage so a client can poll progress.
 *
 * NOTE: this does NOT generate embeddings yet — that's Module 4. After
 * this function, status lands on 'embedding' to signal "chunked and
 * waiting to be vectorized", not 'ready' yet.
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

    const chunks = await chunkText(text);
    await chunkRepository.insertChunks(document.id, chunks);

    logger.info(
      { documentId: document.id, pageCount, chunkCount: chunks.length },
      'Document parsed and chunked successfully'
    );

    // Status lands here, not 'ready' — Module 4 flips it to 'ready' once
    // embeddings are generated and stored in ChromaDB.
    return documentRepository.updateDocumentStatus(document.id, 'embedding', { pageCount });
  } catch (err) {
    // If anything in the pipeline fails, record WHY on the document row
    // instead of leaving it stuck at 'parsing' with no explanation.
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
  const deleted = await documentRepository.deleteDocument(id);
  if (!deleted) {
    throw new AppError(`Document not found: ${id}`, 404);
  }
}
