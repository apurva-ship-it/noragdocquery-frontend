import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface FileData {
  id: string;
  content: string;
}

const FileEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Auth check and load file
  useEffect(() => {
    // Ensure user is authenticated
    fetch('/api/v1/users/me', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('unauth');
      })
      .catch(() => navigate('/login'));
    // Load file content
    fetch(`/api/v1/files/${id}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load file');
        }
        return res.json() as Promise<FileData>;
      })
      .then((data) => setFile(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (file) setFile({ ...file, content: e.target.value });
  };

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/v1/files/${file.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: file.content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }
      const data = await res.json();
      setSuccessMsg(`Saved successfully. Version ID: ${data.version_id ?? 'N/A'}`);
      // Stay on page to show message; optional navigation after short delay
      setTimeout(() => navigate('/'), 1500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit File</h1>
      <textarea
        value={file?.content ?? ''}
        onChange={handleChange}
        rows={20}
        className="w-full p-2 border rounded focus:outline-none focus:ring"
      />
      {successMsg && <div className="mt-2 text-green-600">{successMsg}</div>}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50`}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FileEditor;
