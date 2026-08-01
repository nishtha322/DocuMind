// src/components/layout/AppLayout.jsx


import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useDocuments } from '../../hooks/useDocuments';

export function AppLayout() {
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const documentsState = useDocuments();

  async function handleUpload(file) {
    const doc = await documentsState.upload(file);
    navigate(`/documents/${doc.id}`);
    return doc;
  }

  async function handleDelete(id) {
    await documentsState.remove(id);
    if (activeId === id) navigate('/');
  }

  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar
        documents={documentsState.documents}
        isLoading={documentsState.isLoading}
        error={documentsState.error}
        activeId={activeId}
        onUpload={handleUpload}
        onSelect={(id) => navigate(`/documents/${id}`)}
        onDelete={handleDelete}
      />
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ ...documentsState, onUpload: handleUpload }} />
      </main>
    </div>
  );
}
