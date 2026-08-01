// src/api/documents.js
//
// Every function here maps 1:1 to a real backend endpoint (see the
// project's openapi.yaml — nothing here is invented). The backend wraps
// successful responses as { success: true, data: ... }; these functions
// unwrap that so callers just get the data itself.

import { apiClient } from './client';

/**
 * POST /documents/upload — uploads a PDF and starts the ingestion pipeline.
 * @param {File} file
 * @returns {Promise<object>} the created document (status: 'uploaded')
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

/**
 * GET /documents — lists all documents.
 * @returns {Promise<object[]>}
 */
export async function listDocuments() {
  const response = await apiClient.get('/documents');
  return response.data.data;
}

/**
 * GET /documents/:id — fetches one document (includes current status).
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getDocument(id) {
  const response = await apiClient.get(`/documents/${id}`);
  return response.data.data;
}


export async function getDocumentChunks(id) {
  const response = await apiClient.get(`/documents/${id}/chunks`);
  return response.data.data;
}


export async function deleteDocument(id) {
  await apiClient.delete(`/documents/${id}`);
}


export async function askDocument(id, question) {
  const response = await apiClient.post(`/documents/${id}/ask`, { question });
  return response.data.data;
}
