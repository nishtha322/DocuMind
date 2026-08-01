// src/controllers/health.controller.js
//
// WHY A HEALTH CHECK MATTERS:
// This isn't just a "hello world" — health check endpoints are a real
// production pattern. Load balancers, Docker, and orchestrators like
// Kubernetes ping this endpoint to know if your app instance is alive
// and should keep receiving traffic. We'll expand this later (e.g. to
// also check DB/ChromaDB connectivity), but for now it proves the server
// itself is up.

import { catchAsync } from '../utils/catchAsync.js';
import { testConnection } from '../config/db.js';
import { testChromaConnection } from '../config/chroma.js';

export const getHealth = catchAsync(async (req, res) => {
  // Actively check every external dependency rather than assuming they're
  // fine — this is what makes the health check useful to an orchestrator
  // deciding whether to route traffic to this instance.
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
