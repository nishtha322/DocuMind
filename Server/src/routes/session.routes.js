// File: src/routes/session.routes.js

import { Router } from 'express';
import { getSessionMessages, askInSession } from '../controllers/chat.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { aiLimiter } from '../middleware/rateLimit.middleware.js';
import { sessionIdParamSchema, askInSessionBodySchema } from '../validators/chat.validators.js';

const router = Router();

router.get(
  '/:sessionId/messages',
  validate(sessionIdParamSchema, 'params'),
  getSessionMessages
);

// Continue a chat session
router.post(
  '/:sessionId/messages',
  aiLimiter,
  validate(sessionIdParamSchema, 'params'),
  validate(askInSessionBodySchema),
  askInSession
);

export default router;