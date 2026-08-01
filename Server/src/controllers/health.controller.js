import { catchAsync } from '../utils/catchAsync.js';

export const getHealth = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Document Assistant API is running',
    timestamp: new Date().toISOString(),
  });
});