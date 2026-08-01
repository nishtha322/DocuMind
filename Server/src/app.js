// src/app.js
//
// WHY app.js IS SEPARATE FROM server.js:
// app.js builds and configures the Express application (middleware, routes,
// error handlers) but does NOT start listening on a port. server.js does
// that. Splitting them means we can import `app` directly in tests (e.g.
// with supertest) later without actually binding to a network port.

import express from 'express';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Parse incoming JSON request bodies into req.body.
app.use(express.json());


app.use(pinoHttp({ logger }));


app.use('/api/v1', routes);


app.use(notFoundHandler);


app.use(errorHandler);

export default app;
