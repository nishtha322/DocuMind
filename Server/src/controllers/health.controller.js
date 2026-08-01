// src/controllers/health.controller.js
import { catchAsync } from '../utils/catchAsync.js';
import { testConnection } from '../config/db.js';

export const getHealth = catchAsync(async (req, res) => {

  let dbStatus = 'ok';
  try {
    await testConnection();
  } catch (err) {
    dbStatus = 'unreachable';
  }

  res.status(200).json({
    success: true,
    message: 'AI Document Assistant API is running',
    timestamp: new Date().toISOString(),
    dependencies: {
      database: dbStatus,
    },
  });
});
