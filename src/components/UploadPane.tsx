import React, { useRef, useEffect } from "react";
import { useDocuments } from "../hooks/useDocuments";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"];
const MAX_MB = 10;

export default function UploadPane() {
  const { documents, uploading, error, upload, loadDocuments, clearError } = useDocuments();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const oversized = files.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (oversized) {
      alert(`"${oversized.name}" exceeds ${MAX_MB} MB limit.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    await upload(files);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow h-full">
      <h2 className="text-lg font-semibold text-gray-800">Upload Documents</h2>

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition-colors">
        <span className="text-sm text-gray-500 mb-1">Click to select files</span>
        <span className="text-xs text-gray-400">{ALLOWED_EXTENSIONS.join(", ")} · max {MAX_MB} MB each</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
          aria-label="Upload documents"
        />
      </label>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600" role="status">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          Uploading…
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start justify-between gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">
          <span>{error}</span>
          <button onClick={clearError} aria-label="Dismiss error" className="text-red-400 hover:text-red-600 font-bold leading-none">×</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Uploaded documents ({documents.length})</h3>
        {documents.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No documents yet.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.document_name} className="bg-gray-50 rounded p-2 text-sm">
                <p className="font-medium text-gray-800 truncate">{doc.document_name}</p>
                <p className="text-xs text-gray-400">
                  {doc.total_characters.toLocaleString()} chars · {doc.chunk_count} chunk{doc.chunk_count !== 1 ? "s" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
