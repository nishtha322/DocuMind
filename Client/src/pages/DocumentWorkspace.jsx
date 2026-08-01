// src/pages/DocumentWorkspace.jsx


import { useParams } from 'react-router-dom';

export function DocumentWorkspace() {
  const { id } = useParams();

  return (
    <div className="flex h-full items-center justify-center px-6 text-center">
      <div>
        <p className="font-medium text-ink">Document workspace</p>
        <p className="mt-1 text-sm text-ink-muted">
          Chat interface for document <code className="text-xs">{id}</code> — built in Module 2.
        </p>
      </div>
    </div>
  );
}
