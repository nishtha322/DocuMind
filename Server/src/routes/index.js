// src/routes/index.js
//
// WHY A CENTRAL ROUTE INDEX:
// As we add documents.routes.js, chat.routes.js, etc. in later modules,
// app.js shouldn't need to know about every single route file. It just
// mounts THIS one router, and this file is the single place that wires
// up every feature's routes. Keeps app.js clean and this file becomes a
// readable "table of contents" of the whole API surface.

import { Router } from 'express';
import healthRoutes from './health.routes.js';
import documentRoutes from './document.routes.js';
import sessionRoutes from './session.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/documents', documentRoutes);
router.use('/sessions', sessionRoutes);

// Future modules will add lines like:
// router.use('/chat', chatRoutes);

export default router;
