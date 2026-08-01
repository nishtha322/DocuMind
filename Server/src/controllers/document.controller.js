// src/controllers/document.controller.js
//
// NOTE: `createDocumentRecord` (JSON body, no real file) is the endpoint
// from Module 2, kept as-is — it's a lightweight way to create a metadata-
// only document record for testing. `uploadDocument` below is the REAL
// production flow added in Module 3: real multipart/form-data upload,
// PDF parsing, and chunking, all behind the same service-layer contract.

import { catchAsync } from '../utils/catchAsync.js';
import * as documentService from '../services/document.service.js';
import * as chunkRepository from '../repositories/chunk.repository.js';

export const uploadDocument = catchAsync(async (req, res) => {
  // By the time we get here, `uploadPdf` middleware has already validated
  // the file is a real PDF, saved it to disk, and populated req.file.
  const document = await documentService.uploadAndProcessDocument(req.file);
  res.status(201).json({ success: true, data: document });
});

export const getDocumentChunks = catchAsync(async (req, res) => {
  // Confirms the document exists (throws 404 via the service if not)
  // before returning its chunks.
  await documentService.getDocumentById(req.params.id);
  const chunks = await chunkRepository.findChunksByDocumentId(req.params.id);
  res.status(200).json({ success: true, data: chunks });
});

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
