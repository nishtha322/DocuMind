// src/pages/UploadPage.jsx


import { Upload } from 'lucide-react';

export function UploadPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface px-8 py-12">
        <Upload size={28} className="text-accent" />
        <p className="font-medium text-ink">Drop a PDF here, or click to browse</p>
        <p className="text-sm text-ink-muted">PDF only · up to 20MB</p>
      </div>
      <p className="text-sm text-ink-muted">
        Upload a document to start asking questions about it.
      </p>
    </div>
  );
}
