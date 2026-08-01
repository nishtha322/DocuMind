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
import { uploadPdf } from '../middleware/upload.middleware.js';

const router = Router();


router.post('/upload', uploadPdf, uploadDocument);

router.post('/', createDocumentRecord);
router.get('/', listDocuments);
router.get('/:id', getDocument);
router.get('/:id/chunks', getDocumentChunks);
router.post('/:id/ask', askQuestion);
router.delete('/:id', deleteDocument);

export default router;
