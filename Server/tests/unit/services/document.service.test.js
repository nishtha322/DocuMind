// File: tests/unit/services/document.service.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/repositories/document.repository.js', () => ({
  createDocument: vi.fn(),
  findDocumentById: vi.fn(),
  updateDocumentStatus: vi.fn(),
  deleteDocument: vi.fn(),
}));

vi.mock('../../../src/repositories/chunk.repository.js', () => ({
  insertChunks: vi.fn(),
  markChunksEmbedded: vi.fn(),
}));

vi.mock('../../../src/services/pdf-parser.service.js', () => ({
  extractTextFromPdf: vi.fn(),
}));

vi.mock('../../../src/services/chunking.service.js', () => ({
  chunkText: vi.fn(),
}));

vi.mock('../../../src/ai/gemini-embeddings.service.js', () => ({
  generateDocumentEmbeddings: vi.fn(),
}));

vi.mock('../../../src/vector-store/chroma.service.js', () => ({
  storeChunkEmbeddings: vi.fn(),
  deleteDocumentVectors: vi.fn(),
}));

import * as documentRepository from '../../../src/repositories/document.repository.js';
import * as chunkRepository from '../../../src/repositories/chunk.repository.js';
import { extractTextFromPdf } from '../../../src/services/pdf-parser.service.js';
import { chunkText } from '../../../src/services/chunking.service.js';
import { generateDocumentEmbeddings } from '../../../src/ai/gemini-embeddings.service.js';
import { storeChunkEmbeddings } from '../../../src/vector-store/chroma.service.js';
import {
  uploadAndProcessDocument,
  getDocumentById,
} from '../../../src/services/document.service.js';

const FILE = { originalname: 'test.pdf', path: '/uploads/test.pdf' };
const NEW_DOC = { id: 'doc-1', status: 'uploaded' };
const CHUNK_ROWS = [
  { id: 'chunk-1', chunk_index: 0, content: 'chunk one' },
  { id: 'chunk-2', chunk_index: 1, content: 'chunk two' },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe('uploadAndProcessDocument', () => {
  it('runs the full pipeline successfully', async () => {
    documentRepository.createDocument.mockResolvedValue(NEW_DOC);
    extractTextFromPdf.mockResolvedValue({
      text: 'full document text',
      pageCount: 3,
    });
    chunkText.mockResolvedValue(['chunk one', 'chunk two']);
    chunkRepository.insertChunks.mockResolvedValue(CHUNK_ROWS);
    generateDocumentEmbeddings.mockResolvedValue([[0.1], [0.2]]);
    documentRepository.updateDocumentStatus.mockResolvedValue({
      ...NEW_DOC,
      status: 'ready',
    });

    const result = await uploadAndProcessDocument(FILE);

    // Check status updates
    const statusCalls = documentRepository.updateDocumentStatus.mock.calls.map(
      (c) => c[1]
    );
    expect(statusCalls).toEqual(['parsing', 'embedding', 'ready']);

    expect(generateDocumentEmbeddings).toHaveBeenCalledWith([
      'chunk one',
      'chunk two',
    ]);

    expect(storeChunkEmbeddings).toHaveBeenCalledWith(
      'doc-1',
      CHUNK_ROWS,
      [[0.1], [0.2]]
    );

    expect(result.status).toBe('ready');
  });

  it('marks the document as failed if PDF parsing fails', async () => {
    documentRepository.createDocument.mockResolvedValue(NEW_DOC);
    extractTextFromPdf.mockRejectedValue(new Error('Invalid PDF structure'));

    await expect(uploadAndProcessDocument(FILE)).rejects.toThrow();

    const failedCall = documentRepository.updateDocumentStatus.mock.calls.find(
      (c) => c[1] === 'failed'
    );

    expect(failedCall).toBeDefined();
    expect(failedCall[2].errorMessage).toBeTruthy();

    expect(generateDocumentEmbeddings).not.toHaveBeenCalled();
  });

  it('marks the document as failed if embedding generation fails', async () => {
    documentRepository.createDocument.mockResolvedValue(NEW_DOC);
    extractTextFromPdf.mockResolvedValue({ text: 'text', pageCount: 1 });
    chunkText.mockResolvedValue(['chunk one']);
    chunkRepository.insertChunks.mockResolvedValue([CHUNK_ROWS[0]]);
    generateDocumentEmbeddings.mockRejectedValue(
      new Error('Gemini quota exceeded')
    );

    await expect(uploadAndProcessDocument(FILE)).rejects.toThrow();

    const failedCall = documentRepository.updateDocumentStatus.mock.calls.find(
      (c) => c[1] === 'failed'
    );

    expect(failedCall).toBeDefined();
  });
});

describe('getDocumentById', () => {
  it('throws a 404 error when the document does not exist', async () => {
    documentRepository.findDocumentById.mockResolvedValue(null);

    await expect(getDocumentById('missing-id')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('returns the document when found', async () => {
    documentRepository.findDocumentById.mockResolvedValue(NEW_DOC);

    const result = await getDocumentById('doc-1');

    expect(result).toEqual(NEW_DOC);
  });
});