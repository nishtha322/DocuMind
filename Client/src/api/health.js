// File: src/api/health.js

import { apiClient } from './client';

/**
 * Check backend health.
 *
 * @returns {Promise<{ success: boolean, dependencies: { database: string, chromadb: string } }>}
 */
export async function checkHealth() {
  const response = await apiClient.get('/health');

  return response.data;
}