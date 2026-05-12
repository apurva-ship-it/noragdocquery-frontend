import { useEffect } from "react";
import type { DocumentPreview } from "../types";

interface PreviewModalProps {
  preview: DocumentPreview | null;
  loading: boolean;
  onClose: () => void;
}

export default function PreviewModal({ preview, loading, onClose }: PreviewModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Document preview"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-800 truncate max-w-lg">
              {loading ? "Loading…" : preview?.document_name ?? "Preview"}
            </h2>
            {preview && !loading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {preview.chunk_count} chunk{preview.chunk_count !== 1 ? "s" : ""} ·{" "}
                {preview.content.length.toLocaleString()} chars
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none ml-4 flex-shrink-0"
            aria-label="Close preview"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <span className="animate-spin inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full mr-2" />
              Loading content…
            </div>
          ) : preview ? (
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
              {preview.content}
            </pre>
          ) : null}
        </div>
      </div>
    </div>
  );
}
