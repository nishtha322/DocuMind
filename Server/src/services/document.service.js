// File: src/services/document.service.js

import * as documentRepository from '../repositories/document.repository.js';
import * as chunkRepository from '../repositories/chunk.repository.js';
import { extractTextFromPdf } from './pdf-parser.service.js';
import { chunkText } from './chunking.service.js';
import { generateDocumentEmbeddings } from '../ai/gemini-embeddings.service.js';
import { storeChunkEmbeddings, deleteDocumentVectors } from '../vector-store/chroma.service.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export async function createDocument({ originalFilename, storagePath }, userId) {
  if (!originalFilename || !storagePath) {
    throw new AppError('originalFilename and storagePath are required', 400);
  }

  return documentRepository.createDocument({
    userId,
    originalFilename,
    storagePath,
  });
}

/**
 * Upload and process a document.
 *
 * @param {{ originalname: string, path: string }} file
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function uploadAndProcessDocument(file, userId) {
  const document = await documentRepository.createDocument({
    userId,
    originalFilename: file.originalname,
    storagePath: file.path,
  });

  try {
    await documentRepository.updateDocumentStatus(document.id, 'parsing');

    const { text, pageCount } = await extractTextFromPdf(file.path);

    const chunkTexts = await chunkText(text);
    const chunks = await chunkRepository.insertChunks(document.id, chunkTexts);

    await documentRepository.updateDocumentStatus(document.id, 'embedding', {
      pageCount,
    });

    // Generate and store embeddings
    const embeddings = await generateDocumentEmbeddings(
      chunks.map((c) => c.content)
    );

    await storeChunkEmbeddings(document.id, chunks, embeddings);
    await chunkRepository.markChunksEmbedded(chunks.map((c) => c.id));

    logger.info(
      {
        documentId: document.id,
        pageCount,
        chunkCount: chunks.length,
      },
      'Document parsed, chunked, and embedded successfully'
    );

    return documentRepository.updateDocumentStatus(document.id, 'ready');
  } catch (err) {
    // Mark the document as failed
    const message =
      err instanceof AppError ? err.message : 'Failed to process document';

    await documentRepository.updateDocumentStatus(document.id, 'failed', {
      errorMessage: message,
    });

    throw err;
  }
}

export async function getDocumentById(id, userId) {
  const document = await documentRepository.findDocumentById(id);

  if (!document || (userId && document.user_id !== userId)) {
    throw new AppError(`Document not found: ${id}`, 404);
  }

  return document;
}

export async function listDocuments(userId) {
  return documentRepository.findDocumentsByUser(userId);
}

export async function removeDocument(id, userId) {
  // Ensure the document exists and belongs to this user
  await getDocumentById(id, userId);

  // Remove vectors before deleting the document
  await deleteDocumentVectors(id);

  const deleted = await documentRepository.deleteDocument(id, userId);

  if (!deleted) {
    throw new AppError(`Document not found: ${id}`, 404);
  }
}