// File: tests/unit/services/rag.service.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/services/document.service.js', () => ({
  getDocumentById: vi.fn(),
}));

vi.mock('../../../src/services/retrieval.service.js', () => ({
  retrieveRelevantChunks: vi.fn(),
}));

vi.mock('../../../src/ai/gemini-chat.service.js', () => ({
  generateAnswer: vi.fn(),
}));

vi.mock('../../../src/repositories/chat.repository.js', () => ({
  createMessage: vi.fn(),
  findMessagesBySession: vi.fn(),
}));

vi.mock('../../../src/services/chat.service.js', () => ({
  getSessionOrThrow: vi.fn(),
}));

import { getDocumentById } from '../../../src/services/document.service.js';
import { retrieveRelevantChunks } from '../../../src/services/retrieval.service.js';
import { generateAnswer } from '../../../src/ai/gemini-chat.service.js';
import * as chatRepository from '../../../src/repositories/chat.repository.js';
import { getSessionOrThrow } from '../../../src/services/chat.service.js';
import {
  answerQuestion,
  answerQuestionInSession,
} from '../../../src/services/rag.service.js';

const READY_DOC = { id: 'doc-1', status: 'ready' };
const NOT_READY_DOC = { id: 'doc-1', status: 'parsing' };

const FAKE_CHUNKS = [
  {
    id: 'chunk-1',
    content: 'Some relevant text.',
    chunkIndex: 0,
    distance: 0.1,
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe('answerQuestion (stateless)', () => {
  it('throws a 400 error for an empty question', async () => {
    await expect(answerQuestion('doc-1', '')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws a 409 error when the document is not ready', async () => {
    getDocumentById.mockResolvedValue(NOT_READY_DOC);

    await expect(
      answerQuestion('doc-1', 'What is this about?')
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('returns a default response when no chunks are found', async () => {
    getDocumentById.mockResolvedValue(READY_DOC);
    retrieveRelevantChunks.mockResolvedValue([]);

    const result = await answerQuestion('doc-1', 'What is this about?');

    expect(result.sources).toEqual([]);
    expect(generateAnswer).not.toHaveBeenCalled();
  });

  it('returns the generated answer with sources', async () => {
    getDocumentById.mockResolvedValue(READY_DOC);
    retrieveRelevantChunks.mockResolvedValue(FAKE_CHUNKS);
    generateAnswer.mockResolvedValue('The answer is 42.');

    const result = await answerQuestion('doc-1', 'What is the answer?');

    expect(result.answer).toBe('The answer is 42.');
    expect(result.sources).toEqual([
      { chunkIndex: 0, distance: 0.1 },
    ]);

    const [, contents] = generateAnswer.mock.calls[0];

    expect(contents).toHaveLength(1);
    expect(contents[0].role).toBe('user');
  });
});

describe('answerQuestionInSession (conversation memory)', () => {
  const SESSION = {
    id: 'session-1',
    document_id: 'doc-1',
  };

  it('throws a 404 error when the session does not exist', async () => {
    getSessionOrThrow.mockRejectedValue(
      Object.assign(new Error('not found'), { statusCode: 404 })
    );

    await expect(
      answerQuestionInSession('missing-session', 'question')
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('saves the user message before generating a response', async () => {
    getSessionOrThrow.mockResolvedValue(SESSION);
    getDocumentById.mockResolvedValue(READY_DOC);
    retrieveRelevantChunks.mockResolvedValue(FAKE_CHUNKS);

    chatRepository.findMessagesBySession.mockResolvedValue([
      {
        role: 'user',
        content: 'question',
        created_at: '2026-01-01',
      },
    ]);

    generateAnswer.mockResolvedValue('Here is the answer.');

    await answerQuestionInSession('session-1', 'question');

    expect(chatRepository.createMessage).toHaveBeenCalledWith(
      'session-1',
      'user',
      'question'
    );

    expect(chatRepository.createMessage).toHaveBeenCalledWith(
      'session-1',
      'assistant',
      'Here is the answer.'
    );

    // User message should be saved first
    const userMsgCallOrder =
      chatRepository.createMessage.mock.invocationCallOrder[0];
    const generateAnswerCallOrder =
      generateAnswer.mock.invocationCallOrder[0];

    expect(userMsgCallOrder).toBeLessThan(generateAnswerCallOrder);
  });

  it('includes previous conversation history', async () => {
    getSessionOrThrow.mockResolvedValue(SESSION);
    getDocumentById.mockResolvedValue(READY_DOC);
    retrieveRelevantChunks.mockResolvedValue(FAKE_CHUNKS);

    chatRepository.findMessagesBySession.mockResolvedValue([
      {
        role: 'user',
        content: 'first question',
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        role: 'assistant',
        content: 'first answer',
        created_at: '2026-01-01T00:00:01Z',
      },
      {
        role: 'user',
        content: 'second question',
        created_at: '2026-01-01T00:00:02Z',
      },
    ]);

    generateAnswer.mockResolvedValue('second answer');

    await answerQuestionInSession('session-1', 'second question');

    const [, contents] = generateAnswer.mock.calls[0];

    expect(contents).toHaveLength(3);
    expect(contents[0]).toEqual({
      role: 'user',
      parts: [{ text: 'first question' }],
    });
    expect(contents[1]).toEqual({
      role: 'model',
      parts: [{ text: 'first answer' }],
    });
    expect(contents[2].role).toBe('user');
  });
});