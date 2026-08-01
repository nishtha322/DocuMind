// File: src/hooks/useDocuments.js

import { useCallback, useEffect, useState } from 'react';
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
} from '../api/documents';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = useCallback(async (file) => {
    setError(null);

    const doc = await uploadDocument(file);

    // Add the new document to the list
    setDocuments((prev) => [doc, ...prev]);

    return doc;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteDocument(id);

    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Update a document without reloading the full list
  const updateOne = useCallback((updatedDoc) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );
  }, []);

  return {
    documents,
    isLoading,
    error,
    refresh,
    upload,
    remove,
    updateOne,
  };
}