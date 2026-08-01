// File: src/controllers/qa.controller.js

import { catchAsync } from '../utils/catchAsync.js';
import { answerQuestion } from '../services/rag.service.js';

export const askQuestion = catchAsync(async (req, res) => {
  const { question } = req.body;
  const result = await answerQuestion(req.params.id, question);

  res.status(200).json({
    success: true,
    data: result,
  });
});