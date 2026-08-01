// src/controllers/document.controller.js


import { catchAsync } from '../utils/catchAsync.js';
import * as documentService from '../services/document.service.js';

export const createDocumentRecord = catchAsync(async (req, res) => {
  const { originalFilename, storagePath } = req.body;
  const document = await documentService.createDocument({ originalFilename, storagePath });
  res.status(201).json({ success: true, data: document });
});

export const getDocument = catchAsync(async (req, res) => {
  const document = await documentService.getDocumentById(req.params.id);
  res.status(200).json({ success: true, data: document });
});

export const listDocuments = catchAsync(async (req, res) => {
  const documents = await documentService.listDocuments();
  res.status(200).json({ success: true, data: documents });
});

export const deleteDocument = catchAsync(async (req, res) => {
  await documentService.removeDocument(req.params.id);
  res.status(204).send();
});
