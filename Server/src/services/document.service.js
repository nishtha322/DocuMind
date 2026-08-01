// src/services/document.service.js


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

  await deleteDocumentVectors(id);
  const deleted = await documentRepository.deleteDocument(id);
  if (!deleted) {
    throw new AppError(`Document not found: ${id}`, 404);
  }
}
