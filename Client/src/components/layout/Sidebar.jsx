// src/components/layout/Sidebar.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Circle } from 'lucide-react';
import { useHealthStatus } from '../../hooks/useHealthStatus';
import { UploadDropzone } from '../documents/UploadDropzone';
import { DocumentCard } from '../documents/DocumentCard';
import { ErrorBanner } from '../ui/ErrorBanner';
import { Spinner } from '../ui/Spinner';

const STATUS_LABEL = {
  checking: 'Connecting…',
  online: 'Backend connected',
  offline: 'Backend offline',
};

const STATUS_COLOR = {
  checking: 'text-ink-muted',
  online: 'text-success',
  offline: 'text-danger',
};

export function Sidebar({ documents, isLoading, error, activeId, onUpload, onSelect, onDelete }) {
  const status = useHealthStatus();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  async function handleUpload(file) {
    setUploadError(null);
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id, filename) {
    if (!confirm(`Delete "${filename}"? This also deletes its conversation history.`)) return;
    try {
      await onDelete(id);
    } catch (err) {
      setUploadError(err.message);
    }
  }

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 px-5 py-5">
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
          <FileText size={20} className="text-accent" />
          <span>DocuMind</span>
        </Link>
      </div>

      <div className="px-4">
        <UploadDropzone onUpload={handleUpload} isUploading={isUploading} compact />
        {uploadError && (
          <div className="mt-2">
            <ErrorBanner message={uploadError} />
          </div>
        )}
      </div>

      <div className="mt-6 flex-1 overflow-y-auto px-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
          Documents
        </p>

        {isLoading && (
          <div className="flex items-center gap-2 py-3 text-sm text-ink-muted">
            <Spinner size={14} /> Loading…
          </div>
        )}

        {!isLoading && error && <ErrorBanner message={error} />}

        {!isLoading && !error && documents.length === 0 && (
          <p className="text-sm text-ink-muted">No documents yet.</p>
        )}

        <div className="flex flex-col gap-1.5">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isActive={doc.id === activeId}
              onSelect={() => onSelect(doc.id)}
              onDelete={() => handleDelete(doc.id, doc.original_filename)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className={`flex items-center gap-2 text-xs ${STATUS_COLOR[status]}`}>
          <Circle size={8} className="fill-current" />
          {STATUS_LABEL[status]}
        </div>
      </div>
    </aside>
  );
}
