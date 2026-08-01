// src/routes/health.routes.js
//
// Routes files should ONLY map an HTTP verb + path to a controller
// function. No logic here — if you find yourself writing an if-statement
// in a routes file, it belongs in a controller or service instead.

import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = Router();

router.get('/', getHealth);

export default router;
