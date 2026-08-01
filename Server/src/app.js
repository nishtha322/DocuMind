// src/app.js


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

// If no route matched above, this catches it as a clean 404 JSON response
// instead of Express's default HTML error page.
app.use(notFoundHandler);


app.use(errorHandler);

export default app;
