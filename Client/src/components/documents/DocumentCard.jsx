// src/components/documents/DocumentCard.jsx

import { Trash2 } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

export function DocumentCard({ document, isActive, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={`group flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
        isActive
          ? 'border-accent bg-accent-soft'
          : 'border-transparent hover:border-border hover:bg-canvas'
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{document.original_filename}</p>
        <div className="mt-1">
          <StatusBadge status={document.status} />
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Delete ${document.original_filename}`}
        className="shrink-0 rounded p-1 text-ink-muted opacity-0 hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
