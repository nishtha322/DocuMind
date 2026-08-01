// File: src/api/documents.js

import { apiClient } from './client';

/**
 * Upload a PDF document.
 *
 * @param {File} file
 * @returns {Promise<object>}
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

/**
 * Get all documents.
 *
 * @returns {Promise<object[]>}
 */
export async function listDocuments() {
  const response = await apiClient.get('/documents');

  return response.data.data;
}

/**
 * Get a document by ID.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getDocument(id) {
  const response = await apiClient.get(`/documents/${id}`);

  return response.data.data;
}

/**
 * Get document chunks.
 *
 * @param {string} id
 * @returns {Promise<object[]>}
 */
export async function getDocumentChunks(id) {
  const response = await apiClient.get(`/documents/${id}/chunks`);

  return response.data.data;
}

/**
 * Delete a document.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteDocument(id) {
  await apiClient.delete(`/documents/${id}`);
}

/**
 * Ask a question about a document.
 *
 * @param {string} id
 * @param {string} question
 * @returns {Promise<{ answer: string, sources: object[] }>}
 */
export async function askDocument(id, question) {
  const response = await apiClient.post(`/documents/${id}/ask`, {
    question,
  });

  return response.data.data;
}