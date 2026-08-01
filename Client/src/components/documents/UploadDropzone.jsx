// File: src/components/documents/UploadDropzone.jsx

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Spinner } from '../ui/Spinner';

export function UploadDropzone({ onUpload, isUploading, compact = false }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(files) {
    const file = files?.[0];
    if (file) {
      onUpload(file);
    }
  }

  const baseClasses = compact
    ? 'flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm font-medium'
    : 'flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-8 py-12';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) =>
        (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()
      }
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`${baseClasses} cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent-soft ${
        isDragActive
          ? 'scale-[1.01] border-accent bg-accent-soft'
          : 'border-border hover:border-accent'
      } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {isUploading ? (
        <Spinner size={compact ? 16 : 24} />
      ) : (
        <Upload size={compact ? 16 : 28} className="text-accent" />
      )}

      {compact ? (
        <span className="text-ink-muted">
          {isUploading ? 'Uploading…' : 'Upload PDF'}
        </span>
      ) : (
        <>
          <p className="font-medium text-ink">
            {isUploading
              ? 'Uploading…'
              : 'Drop a PDF here, or click to browse'}
          </p>
          <p className="text-sm text-ink-muted">PDF only · up to 20MB</p>
        </>
      )}
    </div>
  );
}