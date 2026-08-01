// src/pages/UploadPage.jsx


import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UploadDropzone } from '../components/documents/UploadDropzone';
import { ErrorBanner } from '../components/ui/ErrorBanner';

export function UploadPage() {
  const { onUpload } = useOutletContext();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleUpload(file) {
    setError(null);
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-full max-w-md">
        <UploadDropzone onUpload={handleUpload} isUploading={isUploading} />
      </div>
      {error && (
        <div className="w-full max-w-md">
          <ErrorBanner message={error} />
        </div>
      )}
      <p className="text-sm text-ink-muted">
        Upload a document to start asking questions about it.
      </p>
    </div>
  );
}
