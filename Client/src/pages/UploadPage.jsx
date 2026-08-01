// src/pages/UploadPage.jsx

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText } from 'lucide-react';
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
    <div className="flex h-full animate-fade-in flex-col items-center justify-center gap-5 px-4 text-center sm:px-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
        <FileText size={22} className="text-accent" />
      </div>

      <div>
        <h1 className="text-lg font-semibold text-ink">
          Ask your documents anything
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Upload a PDF to start a grounded, source-cited conversation.
        </p>
      </div>

      <div className="w-full max-w-md">
        <UploadDropzone
          onUpload={handleUpload}
          isUploading={isUploading}
        />
      </div>

      {error && (
        <div className="w-full max-w-md">
          <ErrorBanner message={error} />
        </div>
      )}
    </div>
  );
}