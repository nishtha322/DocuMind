// src/api/chat.js


import { apiClient } from './client';


export async function createSession(documentId, title) {
  const response = await apiClient.post(`/documents/${documentId}/sessions`, title ? { title } : {});
  return response.data.data;
}


export async function listSessions(documentId) {
  const response = await apiClient.get(`/documents/${documentId}/sessions`);
  return response.data.data;
}
export async function getSessionMessages(sessionId) {
  const response = await apiClient.get(`/sessions/${sessionId}/messages`);
  return response.data.data;
}


export async function askInSession(sessionId, question) {
  const response = await apiClient.post(`/sessions/${sessionId}/messages`, { question });
  return response.data.data;
}
