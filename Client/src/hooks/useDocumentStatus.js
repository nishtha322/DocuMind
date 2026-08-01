// File: src/hooks/useDocumentStatus.js

import { useEffect, useRef, useState } from 'react';
import { getDocument } from '../api/documents';

const POLL_INTERVAL_MS = 2000;
const TERMINAL_STATUSES = ['ready', 'failed'];

/**
 * @param {string} documentId
 * @param {object} initialDoc
 * @param {(doc: object) => void} [onUpdate]
 */
export function useDocumentStatus(documentId, initialDoc, onUpdate) {
  const [document, setDocument] = useState(initialDoc || null);
  const [error, setError] = useState(null);

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    let cancelled = false;
    let timer;

    async function poll() {
      try {
        const doc = await getDocument(documentId);

        if (cancelled) return;

        setDocument(doc);
        onUpdateRef.current?.(doc);

        // Keep polling until processing is complete
        if (!TERMINAL_STATUSES.includes(doc.status)) {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [documentId]);

  return {
    document,
    error,
  };
}