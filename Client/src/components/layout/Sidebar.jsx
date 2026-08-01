// src/components/layout/Sidebar.jsx


import { Link } from 'react-router-dom';
import { FileText, Upload, Circle } from 'lucide-react';
import { useHealthStatus } from '../../hooks/useHealthStatus';

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

export function Sidebar() {
  const status = useHealthStatus();

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 px-5 py-5">
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
          <FileText size={20} className="text-accent" />
          <span>AI Document Assistant</span>
        </Link>
      </div>

      <div className="px-4">
        <Link
          to="/"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm font-medium text-ink-muted hover:border-accent hover:text-accent"
        >
          <Upload size={16} />
          Upload PDF
        </Link>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto px-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
          Documents
        </p>
      
        <p className="text-sm text-ink-muted">No documents yet.</p>
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
