// src/routes/document.routes.js

import { Router } from 'express';
import {
  createDocumentRecord,
  getDocument,
  listDocuments,
  deleteDocument,
} from '../controllers/document.controller.js';

const router = Router();

router.post('/', createDocumentRecord);
router.get('/', listDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

export default router;
