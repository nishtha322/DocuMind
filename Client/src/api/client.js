// src/api/client.js

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 30000, // generous — document upload + embedding can take a while
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);
