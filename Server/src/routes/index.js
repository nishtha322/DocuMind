// src/routes/index.js


import { Router } from 'express';
import healthRoutes from './health.routes.js';
import documentRoutes from './document.routes.js';
import sessionRoutes from './session.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/documents', documentRoutes);
router.use('/sessions', sessionRoutes);



export default router;
