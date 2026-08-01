// File: src/routes/document.routes.js

import { Router } from 'express';
import {
  createDocumentRecord,
  uploadDocument,
  getDocument,
  getDocumentChunks,
  listDocuments,
  deleteDocument,
} from '../controllers/document.controller.js';
import { askQuestion } from '../controllers/qa.controller.js';
import { createSession, listSessions } from '../controllers/chat.controller.js';
import { uploadPdf } from '../middleware/upload.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { aiLimiter } from '../middleware/rateLimit.middleware.js';
import {
  idParamSchema,
  createDocumentBodySchema,
  askQuestionBodySchema,
  createSessionBodySchema,
} from '../validators/document.validators.js';

const router = Router();

// Upload a PDF
router.post('/upload', aiLimiter, uploadPdf, uploadDocument);

router.post('/', validate(createDocumentBodySchema), createDocumentRecord);
router.get('/', listDocuments);
router.get('/:id', validate(idParamSchema, 'params'), getDocument);
router.get('/:id/chunks', validate(idParamSchema, 'params'), getDocumentChunks);

// Ask a question about a document
router.post(
  '/:id/ask',
  aiLimiter,
  validate(idParamSchema, 'params'),
  validate(askQuestionBodySchema),
  askQuestion
);

// Chat session routes
router.post(
  '/:id/sessions',
  validate(idParamSchema, 'params'),
  validate(createSessionBodySchema),
  createSession
);

router.get('/:id/sessions', validate(idParamSchema, 'params'), listSessions);

router.delete('/:id', validate(idParamSchema, 'params'), deleteDocument);

export default router;