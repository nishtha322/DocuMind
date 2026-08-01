// File: src/components/documents/DocumentCard.jsx

import { FileText, Trash2 } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

export function DocumentCard({ document, isActive, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={`group flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all duration-150 ${
        isActive
          ? 'border-accent bg-accent-soft shadow-sm'
          : 'border-transparent hover:border-border hover:bg-canvas'
      }`}
    >
      <FileText
        size={16}
        className={`mt-0.5 shrink-0 ${
          isActive ? 'text-accent' : 'text-ink-muted'
        }`}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">
          {document.original_filename}
        </p>

        <div className="mt-1">
          <StatusBadge status={document.status} />
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Prevent opening the document
          onDelete();
        }}
        aria-label={`Delete ${document.original_filename}`}
        className="shrink-0 rounded p-1 text-ink-muted opacity-0 transition-opacity hover:bg-danger-soft hover:text-danger group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}