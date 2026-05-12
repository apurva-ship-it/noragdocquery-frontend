import React, { useState, useEffect, useRef } from 'react';

const ALLOWED_EXTENSIONS = ['.txt', '.pdf', '.docx'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface Document {
  id: string | number;
  name: string;
  char_count: number;
}

const UploadPane: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents', { credentials: 'include' });
      if (res.ok) {
        const data: Document[] = await res.json();
        setDocuments(data);
      }
    } catch {
      // silently ignore list fetch failures
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlert(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setAlert(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setAlert(`File "${file.name}" exceeds the 10 MB size limit.`);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setAlert(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/documents', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 413) {
          setAlert('File exceeds the server size limit.');
        } else if (res.status === 415) {
          setAlert('File type not supported by the server.');
        } else {
          const data = await res.json().catch(() => ({})) as { detail?: string; error?: string };
          setAlert(data.detail ?? data.error ?? 'Upload failed.');
        }
        return;
      }

      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setLoadingDocs(true);
      await fetchDocuments();
    } catch {
      setAlert('Network error — is the backend running?');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Document</h2>

        <div className="mb-4">
          <label htmlFor="doc-file-input" className="block text-sm font-medium text-gray-700 mb-1">
            Select file{' '}
            <span className="text-gray-400 font-normal">
              ({ALLOWED_EXTENSIONS.join(', ')} — max 10 MB)
            </span>
          </label>
          <input
            id="doc-file-input"
            ref={inputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(',')}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-describedby={alert ? 'upload-alert' : undefined}
          />
        </div>

        {selectedFile && (
          <p className="text-sm text-gray-500 mb-3">
            {selectedFile.name} — {(selectedFile.size / 1024).toFixed(0)} KB
          </p>
        )}

        {alert && (
          <div
            id="upload-alert"
            role="alert"
            className="flex items-start justify-between bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-4 text-sm text-red-700"
          >
            <span>{alert}</span>
            <button
              type="button"
              onClick={() => setAlert(null)}
              className="ml-4 flex-shrink-0 text-red-500 hover:text-red-700 font-medium"
              aria-label="Dismiss alert"
            >
              &#x2715;
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Documents</h2>

        {loadingDocs ? (
          <div className="animate-pulse space-y-2" aria-busy="true" aria-label="Loading documents">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-gray-400">No documents uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100" aria-label="Uploaded documents">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="text-gray-800 font-medium truncate mr-4">{doc.name}</span>
                <span className="text-gray-400 whitespace-nowrap">
                  {doc.char_count.toLocaleString()} chars
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UploadPane;
