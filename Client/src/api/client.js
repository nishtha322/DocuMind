// File: src/api/client.js

import axios from 'axios';

export const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') + '/api/v1',
  timeout: 30000,

  // Send HttpOnly cookies with every request
  withCredentials: true,
});

// Return a consistent error message
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