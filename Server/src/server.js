// src/server.js


import app from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port} [${config.nodeEnv}]`);
});

// Safety net: if a promise rejection is never caught anywhere (a bug we
// missed), log it clearly and shut down gracefully instead of leaving the
// process in a corrupted, half-working state.
process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'UNHANDLED REJECTION! Shutting down...');
  server.close(() => process.exit(1));
});
