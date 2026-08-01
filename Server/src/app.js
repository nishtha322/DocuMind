// src/app.js
//
// WHY app.js IS SEPARATE FROM server.js:
// app.js builds and configures the Express application (middleware, routes,
// error handlers) but does NOT start listening on a port. server.js does
// that. Splitting them means we can import `app` directly in tests (e.g.
// with supertest) later without actually binding to a network port.

import express from 'express';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();


app.use(express.json());


app.use(pinoHttp({ logger }));


const openApiSpec = parseYaml(readFileSync(path.join(__dirname, '..', 'openapi.yaml'), 'utf-8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));


app.use('/api/v1', generalLimiter);


app.use('/api/v1', routes);

app.use(notFoundHandler);


app.use(errorHandler);

export default app;
