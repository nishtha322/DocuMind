// src/routes/session.routes.js
//
// WHY THESE ARE SEPARATE FROM document.routes.js (not /documents/:id/sessions/:sessionId/...):
// Once you have a session ID, every subsequent operation on it (read
// history, ask a follow-up) only needs the session ID — routing through
// the parent document ID again would be redundant and would require an
// extra lookup just to validate two IDs are consistent with each other.
// This mirrors how most chat/thread APIs are shaped (e.g. a thread ID is
// enough to operate on a thread once you have one).

import { Router } from 'express';
import { getSessionMessages, askInSession } from '../controllers/chat.controller.js';

const router = Router();

router.get('/:sessionId/messages', getSessionMessages);
router.post('/:sessionId/messages', askInSession);

export default router;
