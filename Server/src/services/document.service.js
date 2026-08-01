// src/services/document.service.js

import * as documentRepository from '../repositories/document.repository.js';
import { AppError } from '../utils/AppError.js';

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
