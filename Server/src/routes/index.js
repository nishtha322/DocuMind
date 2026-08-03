// File: src/routes/index.js

import { Router } from 'express';
import healthRoutes from './health.routes.js';
import documentRoutes from './document.routes.js';
import sessionRoutes from './session.routes.js';
import { anonymousUser } from '../middleware/anonymousUser.middleware.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/documents', anonymousUser, documentRoutes);
router.use('/sessions', anonymousUser, sessionRoutes);

export default router;