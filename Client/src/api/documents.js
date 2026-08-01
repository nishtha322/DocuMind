// src/api/documents.js

import { apiClient } from './client';


export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}


export async function listDocuments() {
  const response = await apiClient.get('/documents');
  return response.data.data;
}


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
