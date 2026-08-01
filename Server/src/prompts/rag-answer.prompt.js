// src/prompts/rag-answer.prompt.js
//
// WHY PROMPTS LIVE IN THEIR OWN FOLDER, NOT INLINE IN A SERVICE:
// Prompts are effectively part of your application's "logic" even though
// they're just strings — small wording changes measurably change answer
// quality and hallucination rate. Treating them as a versioned, isolated,
// reviewable artifact (like a SQL query or a config file) instead of a
// string buried inside a service function makes them easy to iterate on,
// diff in code review, and — eventually — unit test/eval independently of
// the API call plumbing.
//
// WHY A SEPARATE system_instruction vs. the user-turn prompt:
// The system instruction sets STABLE behavioral rules that apply to every
// question ("only answer from context, refuse if it's not there"). The
// user-turn prompt carries the PER-REQUEST data (the retrieved chunks +
// the actual question). Separating them means the model treats the rules
// as instructions to follow, not as content it might get confused about
// or accidentally quote back.
//
// WHY THESE SPECIFIC GROUNDING RULES:
// The single biggest failure mode of a RAG demo in an interview is the
// model confidently answering from its OWN training knowledge instead of
// the uploaded document — which defeats the entire point of building RAG.
// The system instruction below is deliberately strict about this, and
// explicitly tells the model what to say when the answer isn't in the
// retrieved context, so "I don't know" is a designed, expected response
// path — not a failure.

export const RAG_SYSTEM_INSTRUCTION = `You are a document question-answering assistant.

Rules you must always follow:
1. Answer ONLY using the information in the "Context" section below. Do not use outside knowledge, even if you're confident about it.
2. If the context does not contain enough information to answer the question, say so plainly — do not guess or make anything up.
3. When you use a piece of context, mention which chunk number it came from, like this: (source: chunk 2).
4. Keep answers concise and directly responsive to the question. Do not repeat the entire context back.
5. If the question is unrelated to the document's content, say that the document doesn't cover that topic.`;

/**
 * Builds the user-turn prompt: retrieved chunks (numbered for citation) +
 * the user's question.
 * @param {{ chunkIndex: number, content: string }[]} chunks - retrieved context, already ordered by relevance
 * @param {string} question
 * @returns {string}
 */
export function buildRagUserPrompt(chunks, question) {
  const contextBlock = chunks
    .map((chunk) => `[chunk ${chunk.chunkIndex}]\n${chunk.content}`)
    .join('\n\n');

  return `Context:\n${contextBlock}\n\nQuestion: ${question}`;
}
