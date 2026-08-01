// src/app.js

import express from 'express';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Log every incoming request
app.use(pinoHttp({ logger }));

// API routes (versioned)
app.use('/api/v1', routes);

// Handle unknown routes
app.use(notFoundHandler);

// Global error handler (keep this last)
app.use(errorHandler);

export default app;