import React from 'react';
import UploadPane from '../components/UploadPane';

const DocumentsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-10">
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Documents</h1>
      <UploadPane />
    </div>
  </div>
);

export default DocumentsPage;
