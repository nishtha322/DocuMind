// File: src/validators/document.validators.js

import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid('must be a valid UUID'),
});

export const createDocumentBodySchema = z.object({
  originalFilename: z.string().min(1, 'is required'),
  storagePath: z.string().min(1, 'is required'),
});

export const askQuestionBodySchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, 'is required')
    .max(2000, 'must be under 2000 characters'),
});

// Optional title for a chat session
export const createSessionBodySchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
});