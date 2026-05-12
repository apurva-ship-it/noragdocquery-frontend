import React, { useEffect, useState } from 'react';

interface DocumentItem {
  id: string;
  name: string;
  charCount: number;
}

interface Alert {
  id: string;
  message: string;
}

const ALLOWED_EXTENSIONS = ['txt', 'pdf', 'docx'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const UploadPane: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const fetchDocuments = async () => {
    try {
      const resp = await fetch('/api/documents');
      if (!resp.ok) throw new Error('Failed to fetch documents');
      const data: DocumentItem[] = await resp.json();
      setDocuments(data);
    } catch (e) {
      addAlert('Error loading documents');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const addAlert = (msg: string) => {
    const id = crypto.randomUUID();
    setAlerts((prev) => [...prev, { id, message: msg }]);
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      addAlert('Invalid file type');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      addAlert('File size exceeds 10 MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const resp = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) throw new Error('Upload failed');
      // assume response returns the created document
      const newDoc: DocumentItem = await resp.json();
      setDocuments((prev) => [...prev, newDoc]);
    } catch (err) {
      addAlert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Alerts */}
      {alerts.map((alert) => (
        <div key={alert.id} className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-2">
          <span>{alert.message}</span>
          <button
            type="button"
            aria-label="Dismiss alert"
            onClick={() => dismissAlert(alert.id)}
            className="absolute top-0 right-0 mt-1 mr-2 text-xl leading-none"
          >
            &times;
          </button>
        </div>
      ))}

      {/* File input */}
      <div className="mb-4">
        <label htmlFor="file-upload" className="block mb-1 font-medium">
          Upload document
        </label>
        <input
          id="file-upload"
          type="file"
          accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',')}
          onChange={handleFileChange}
          disabled={uploading}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* Document list */}
      <h2 className="text-lg font-semibold mb-2">Documents</h2>
      {documents.length === 0 ? (
        <p>No documents uploaded.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="border p-2 rounded">
              <div className="font-medium">{doc.name}</div>
              <div className="text-sm text-gray-600">Characters: {doc.charCount}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UploadPane;
