// src/hooks/useChatSession.js


import { useCallback, useEffect, useState } from 'react';
import { createSession, listSessions, getSessionMessages, askInSession } from '../api/chat';

export function useChatSession(documentId) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    let cancelled = false;

    async function restore() {
      setIsLoadingHistory(true);
      setError(null);
      setSessionId(null);
      setMessages([]);
      try {
        const sessions = await listSessions(documentId);
        if (cancelled) return;

        if (sessions.length > 0) {
          const mostRecent = sessions[0]; // backend returns most-recent-first
          const history = await getSessionMessages(mostRecent.id);
          if (cancelled) return;
          setSessionId(mostRecent.id);
          setMessages(history.map(toDisplayMessage));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  const startNewConversation = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  const ask = useCallback(
    async (question) => {
      setError(null);
      setMessages((prev) => [...prev, { role: 'user', content: question }]);
      setIsSending(true);
      try {
        let currentSessionId = sessionId;
        if (!currentSessionId) {
          const session = await createSession(documentId);
          currentSessionId = session.id;
          setSessionId(currentSessionId);
        }
        const result = await askInSession(currentSessionId, question);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.answer, sources: result.sources },
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsSending(false);
      }
    },
    [documentId, sessionId]
  );

  return { messages, isLoadingHistory, isSending, error, ask, startNewConversation };
}

function toDisplayMessage(msg) {

  return { role: msg.role, content: msg.content };
}
