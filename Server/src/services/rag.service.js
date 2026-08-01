// src/services/rag.service.js

const MAX_HISTORY_MESSAGES = 10;


export async function answerQuestion(documentId, question) {
  validateQuestion(question);
  const document = await getDocumentById(documentId); // throws 404 if missing
  assertDocumentReady(document);

  const chunks = await retrieveRelevantChunks(documentId, question);
  if (chunks.length === 0) return emptyRetrievalResult();

  const userPrompt = buildRagUserPrompt(chunks, question);
  const answer = await generateAnswer(RAG_SYSTEM_INSTRUCTION, [
    { role: 'user', parts: [{ text: userPrompt }] },
  ]);

  return { answer, sources: toSources(chunks) };
}

/**
 * Answers a question WITHIN a chat session — this is what makes follow-up
 * questions like "what about the second one?" work. Persists both the
 * user's question and the assistant's answer as chat_messages rows, and
 * includes recent prior turns as real Gemini conversation history (not
 * just re-injected into the text prompt).
 * @param {string} sessionId
 * @param {string} question
 * @returns {Promise<{ answer: string, sources: object[], sessionId: string }>}
 */
export async function answerQuestionInSession(sessionId, question) {
  validateQuestion(question);
  const session = await getSessionOrThrow(sessionId);
  const document = await getDocumentById(session.document_id);
  assertDocumentReady(document);

  // Retrieval always runs against the CURRENT question — RAG doesn't
  // re-retrieve for old turns, only for what's being asked right now.
  const chunks = await retrieveRelevantChunks(session.document_id, question);

  // Persist the user's message before generating — if the Gemini call
  // fails, we still want the question on record (and it means retrying
  // doesn't lose the user's input).
  await chatRepository.createMessage(sessionId, 'user', question);

  const priorMessages = await chatRepository.findMessagesBySession(sessionId, MAX_HISTORY_MESSAGES);
  // Exclude the message we just inserted — it becomes the FINAL turn below,
  // built with retrieved context attached, not as plain history.
  const historyTurns = priorMessages
    .slice(0, -1)
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

  if (chunks.length === 0) {
    const result = emptyRetrievalResult();
    await chatRepository.createMessage(sessionId, 'assistant', result.answer);
    return { ...result, sessionId };
  }

  const userPrompt = buildRagUserPrompt(chunks, question);
  const contents = [...historyTurns, { role: 'user', parts: [{ text: userPrompt }] }];

  const answer = await generateAnswer(RAG_SYSTEM_INSTRUCTION, contents);
  await chatRepository.createMessage(sessionId, 'assistant', answer);

  return { answer, sources: toSources(chunks), sessionId };
}

function validateQuestion(question) {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    throw new AppError('question is required', 400);
  }
}

function assertDocumentReady(document) {
  if (document.status !== 'ready') {
    // Asking a question against a document that's still processing (or
    // failed) would silently retrieve zero chunks and produce a confusing
    // "I don't know" answer. Failing clearly here is far more useful.
    throw new AppError(
      `Document is not ready for questions yet (status: ${document.status})`,
      409
    );
  }
}

function emptyRetrievalResult() {
  // No embeddings found for this document at all — distinct from "the
  // document doesn't cover this topic", which the model itself decides
  // once it has context. This case means retrieval found NOTHING to work with.
  return {
    answer: "I couldn't find any relevant content in this document to answer that question.",
    sources: [],
  };
}

function toSources(chunks) {
  return chunks.map((chunk) => ({ chunkIndex: chunk.chunkIndex, distance: chunk.distance }));
}
