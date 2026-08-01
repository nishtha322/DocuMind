// File: src/components/layout/AppLayout.jsx

import { useState } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useDocuments } from '../../hooks/useDocuments';

export function AppLayout() {
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const documentsState = useDocuments();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function handleUpload(file) {
    const doc = await documentsState.upload(file);

    navigate(`/documents/${doc.id}`);
    setIsSidebarOpen(false);

    return doc;
  }

  async function handleDelete(id) {
    await documentsState.remove(id);

    // Go back to home if the active document is deleted
    if (activeId === id) {
      navigate('/');
    }
  }

  function handleSelect(id) {
    navigate(`/documents/${id}`);
    setIsSidebarOpen(false);
  }

  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar
        documents={documentsState.documents}
        isLoading={documentsState.isLoading}
        error={documentsState.error}
        activeId={activeId}
        onUpload={handleUpload}
        onSelect={handleSelect}
        onDelete={handleDelete}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile menu */}
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas"
          >
            <Menu size={20} />
          </button>

          <span className="font-semibold text-ink">
            AI Document Assistant
          </span>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet
            context={{
              ...documentsState,
              onUpload: handleUpload,
            }}
          />
        </main>
      </div>
    </div>
  );
}