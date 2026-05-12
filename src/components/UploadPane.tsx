import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDocuments } from "../hooks/useDocuments";
import PreviewModal from "./PreviewModal";
import ContextModal from "./ContextModal";
import type { DocumentPreview, ContextResponse } from "../types";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"];
const MAX_MB = 10;

function KbStatusBadge({
  hasKb,
  isStale,
  updatedAt,
}: {
  hasKb: boolean;
  isStale: boolean;
  updatedAt: string | null;
}) {
  if (!hasKb) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
        Not built
      </span>
    );
  }
  if (isStale) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
        Outdated
      </span>
    );
  }
  const ts = updatedAt ? new Date(updatedAt).toLocaleTimeString() : "";
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
      Up to date {ts && `· ${ts}`}
    </span>
  );
}

export default function UploadPane() {
  const {
    documents,
    kbStatus,
    uploading,
    deleting,
    buildingKb,
    error,
    upload,
    loadDocuments,
    removeDocuments,
    updateKnowledgeBase,
    getPreview,
    getContext,
    clearError,
  } = useDocuments();

  const inputRef = useRef<HTMLInputElement>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewData, setPreviewData] = useState<DocumentPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [contextData, setContextData] = useState<ContextResponse | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [showContext, setShowContext] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Drop stale selections when document list changes
  useEffect(() => {
    const names = new Set(documents.map((d) => d.document_name));
    setSelected((prev) => {
      const next = new Set([...prev].filter((n) => names.has(n)));
      return next.size === prev.size ? prev : next;
    });
  }, [documents]);

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

  function toggleSelect(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === documents.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(documents.map((d) => d.document_name)));
    }
  }

  async function handleRemoveSelected() {
    if (selected.size === 0) return;
    await removeDocuments([...selected]);
    setSelected(new Set());
  }

  const handlePreview = useCallback(
    async (name: string) => {
      setPreviewData(null);
      setPreviewLoading(true);
      setShowPreview(true);
      const data = await getPreview(name);
      setPreviewData(data);
      setPreviewLoading(false);
    },
    [getPreview]
  );

  const handleGenerateContext = useCallback(async () => {
    setContextData(null);
    setContextLoading(true);
    setShowContext(true);
    const data = await getContext();
    setContextData(data);
    setContextLoading(false);
  }, [getContext]);

  const allSelected = documents.length > 0 && selected.size === documents.length;
  const someSelected = selected.size > 0 && selected.size < documents.length;

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow h-full">
      <h2 className="text-lg font-semibold text-gray-800">Upload Documents</h2>

      {/* Upload area */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition-colors">
        <span className="text-sm text-gray-500 mb-1">Click to select files</span>
        <span className="text-xs text-gray-400">
          {ALLOWED_EXTENSIONS.join(", ")} · max {MAX_MB} MB each
        </span>
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
        <div
          role="alert"
          className="flex items-start justify-between gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3"
        >
          <span>{error}</span>
          <button
            onClick={clearError}
            aria-label="Dismiss error"
            className="text-red-400 hover:text-red-600 font-bold leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Knowledge base status + Update button */}
      <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 bg-gray-50">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-gray-600">Knowledge Base</span>
          {kbStatus && (
            <KbStatusBadge
              hasKb={kbStatus.has_kb}
              isStale={kbStatus.is_stale}
              updatedAt={kbStatus.updated_at}
            />
          )}
        </div>
        <button
          onClick={() => void updateKnowledgeBase()}
          disabled={buildingKb || documents.length === 0}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          {buildingKb && (
            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
          )}
          {buildingKb ? "Building…" : "Update Knowledge Base"}
        </button>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">
            Documents ({documents.length})
          </h3>
          {documents.length > 0 && (
            <button
              onClick={() => void handleGenerateContext()}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2 py-1 rounded border border-purple-200 hover:border-purple-400 transition-colors"
            >
              View Current Context
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No documents yet.</p>
        ) : (
          <>
            {/* Select-all row */}
            <div className="flex items-center gap-2 px-2 pb-1 border-b border-gray-100 mb-1">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={toggleSelectAll}
                aria-label="Select all documents"
                className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
              />
              <span className="text-xs text-gray-400">Select all</span>
            </div>

            <ul className="space-y-1.5">
              {documents.map((doc) => (
                <li
                  key={doc.document_name}
                  className={`flex items-start gap-2 rounded p-2 text-sm transition-colors ${
                    selected.has(doc.document_name) ? "bg-blue-50" : "bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(doc.document_name)}
                    onChange={() => toggleSelect(doc.document_name)}
                    aria-label={`Select ${doc.document_name}`}
                    className="mt-0.5 w-3.5 h-3.5 accent-blue-600 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate" title={doc.document_name}>
                      {doc.document_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {doc.total_characters.toLocaleString()} chars · {doc.chunk_count} chunk
                      {doc.chunk_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => void handlePreview(doc.document_name)}
                    className="flex-shrink-0 text-xs text-blue-500 hover:text-blue-700 font-medium px-1.5 py-0.5 rounded border border-blue-200 hover:border-blue-400 transition-colors"
                    aria-label={`Preview ${doc.document_name}`}
                  >
                    Preview
                  </button>
                </li>
              ))}
            </ul>

            {/* Remove selected */}
            {selected.size > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => void handleRemoveSelected()}
                  disabled={deleting}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  {deleting && (
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                  )}
                  {deleting
                    ? "Removing…"
                    : `Remove ${selected.size} selected file${selected.size !== 1 ? "s" : ""}`}
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showPreview && (
        <PreviewModal
          preview={previewData}
          loading={previewLoading}
          onClose={() => {
            setShowPreview(false);
            setPreviewData(null);
          }}
        />
      )}

      {showContext && (
        <ContextModal
          context={contextData}
          loading={contextLoading}
          onClose={() => {
            setShowContext(false);
            setContextData(null);
          }}
        />
      )}
    </div>
  );
}
