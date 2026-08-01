// File: src/components/layout/Sidebar.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Circle, X } from 'lucide-react';
import { useHealthStatus } from '../../hooks/useHealthStatus';
import { UploadDropzone } from '../documents/UploadDropzone';
import { DocumentCard } from '../documents/DocumentCard';
import { ErrorBanner } from '../ui/ErrorBanner';
import { SkeletonRow } from '../ui/SkeletonRow';

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

export function Sidebar({
  documents,
  isLoading,
  error,
  activeId,
  onUpload,
  onSelect,
  onDelete,
  isOpen,
  onClose,
}) {
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
    // Confirm before deleting
    if (!confirm(`Delete "${filename}"? This also deletes its conversation history.`)) {
      return;
    }

    try {
      await onDelete(id);
    } catch (err) {
      setUploadError(err.message);
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 animate-fade-in bg-ink/30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 ease-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
            <FileText size={20} className="text-accent" />
            <span>DocuMind</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded p-1 text-ink-muted hover:bg-canvas md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4">
          <UploadDropzone
            onUpload={handleUpload}
            isUploading={isUploading}
            compact
          />

          {uploadError && (
            <div className="mt-2">
              <ErrorBanner message={uploadError} />
            </div>
          )}
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
            Documents
          </p>

          {isLoading && (
            <div className="flex flex-col gap-1.5">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
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
          {/* Backend connection status */}
          <div className={`flex items-center gap-2 text-xs ${STATUS_COLOR[status]}`}>
            <Circle size={8} className="fill-current" />
            {STATUS_LABEL[status]}
          </div>
        </div>
      </aside>
    </>
  );
}