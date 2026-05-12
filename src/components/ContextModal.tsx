import { useEffect } from "react";
import type { ContextResponse } from "../types";

interface ContextModalProps {
  context: ContextResponse | null;
  loading: boolean;
  onClose: () => void;
}

export default function ContextModal({ context, loading, onClose }: ContextModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const estimatedTokens = context ? Math.round(context.total_characters / 4) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Current context"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Current Context (Wiki)</h2>
            {context && !loading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {context.document_count} doc{context.document_count !== 1 ? "s" : ""} ·{" "}
                {context.total_characters.toLocaleString()} chars · ~{estimatedTokens.toLocaleString()} tokens
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none ml-4 flex-shrink-0"
            aria-label="Close context"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <span className="animate-spin inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full mr-2" />
              Building context…
            </div>
          ) : context && context.content ? (
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
              {context.content}
            </pre>
          ) : (
            <p className="text-sm text-gray-400 italic text-center mt-8">
              No documents uploaded yet. Upload files to build the knowledge base.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
