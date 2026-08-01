// src/utils/logger.js


import pino from 'pino';
import { config } from '../config/env.js';

export const logger = pino({
  level: config.isProduction ? 'info' : 'debug',
  // In development, pretty-print logs so they're readable in the terminal.
  // In production, emit raw JSON — that's what log aggregators expect.
  transport: config.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
});
