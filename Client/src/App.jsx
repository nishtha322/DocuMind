// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { UploadPage } from './pages/UploadPage';
import { DocumentWorkspace } from './pages/DocumentWorkspace';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<UploadPage />} />
        <Route path="/documents/:id" element={<DocumentWorkspace />} />
      </Route>
    </Routes>
  );
}