// src/routes/document.routes.js

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

const router = Router();

// Real upload flow: multipart/form-data with field name "file".
// uploadPdf (multer) runs first — validates + saves the file to disk and
// populates req.file — then uploadDocument takes over.
router.post('/upload', uploadPdf, uploadDocument);

router.post('/', createDocumentRecord);
router.get('/', listDocuments);
router.get('/:id', getDocument);
router.get('/:id/chunks', getDocumentChunks);
router.post('/:id/ask', askQuestion);

// Conversation memory: a session groups a series of related questions
// about ONE document so follow-ups have context. See chat.service.js and
// rag.service.js (answerQuestionInSession) for the memory logic itself.
router.post('/:id/sessions', createSession);
router.get('/:id/sessions', listSessions);

router.delete('/:id', deleteDocument);

export default router;
