// File: src/app.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { fileURLToPath } from 'url';
import path from 'path';

import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Enable CORS
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://documind-production-7d04.up.railway.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Parse cookies (used to identify anonymous users)
app.use(cookieParser());

// Log incoming requests
app.use(pinoHttp({ logger }));

// API documentation
const openApiSpec = parseYaml(
  readFileSync(path.join(__dirname, '..', 'openapi.yaml'), 'utf-8')
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Apply rate limiting
app.use('/api/v1', generalLimiter);

// Register API routes
app.use('/api/v1', routes);

// Handle unknown routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;