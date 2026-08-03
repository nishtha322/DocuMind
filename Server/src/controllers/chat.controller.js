// File: src/controllers/chat.controller.js

import { catchAsync } from '../utils/catchAsync.js';
import * as chatService from '../services/chat.service.js';
import { answerQuestionInSession } from '../services/rag.service.js';

export const createSession = catchAsync(async (req, res) => {
  const { title } = req.body;
  const session = await chatService.startSession(
    req.params.id,
    title || null,
    req.userId
  );

  res.status(201).json({
    success: true,
    data: session,
  });
});

export const listSessions = catchAsync(async (req, res) => {
  const sessions = await chatService.listSessions(req.params.id, req.userId);

  res.status(200).json({
    success: true,
    data: sessions,
  });
});

export const getSessionMessages = catchAsync(async (req, res) => {
  const messages = await chatService.getSessionMessages(
    req.params.sessionId,
    req.userId
  );

  res.status(200).json({
    success: true,
    data: messages,
  });
});

export const askInSession = catchAsync(async (req, res) => {
  const { question } = req.body;
  const result = await answerQuestionInSession(
    req.params.sessionId,
    question,
    req.userId
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});