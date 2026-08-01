// src/controllers/health.controller.js

import { catchAsync } from '../utils/catchAsync.js';
import { testConnection } from '../config/db.js';
import { testChromaConnection } from '../config/chroma.js';

export const getHealth = catchAsync(async (req, res) => {
  // Verify external dependencies are reachable.
  const [dbStatus, chromaStatus] = await Promise.all([
    testConnection()
      .then(() => 'ok')
      .catch(() => 'unreachable'),
    testChromaConnection()
      .then(() => 'ok')
      .catch(() => 'unreachable'),
  ]);

  res.status(200).json({
    success: true,
    message: 'AI Document Assistant API is running',
    timestamp: new Date().toISOString(),
    dependencies: {
      database: dbStatus,
      chromadb: chromaStatus,
    },
  });
});