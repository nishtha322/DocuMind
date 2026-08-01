// src/validators/chat.validators.js

import { z } from 'zod';
import { askQuestionBodySchema } from './document.validators.js';

export const sessionIdParamSchema = z.object({
  sessionId: z.string().uuid('must be a valid UUID'),
});


export const askInSessionBodySchema = askQuestionBodySchema;
