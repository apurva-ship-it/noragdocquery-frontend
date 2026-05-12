import React, { useState } from "react";

export interface LLMResult {
  id: string;
  loading: boolean;
  text?: string;
  latency?: number;
  error?: string;
}

interface LLMResultPanelProps {
  results: LLMResult[];
}

export const LLMResultPanel: React.FC<LLMResultPanelProps> = ({ results }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    } catch {
      // clipboard API unavailable in some contexts; fail silently
    }
  };

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div
          key={result.id}
          className="border rounded-lg bg-white shadow-sm overflow-hidden"
        >
          <div className="px-4 py-2 border-b bg-gray-50">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              {result.id}
            </span>
          </div>

          <div className="p-4">
            {result.loading ? (
              <div
                className="animate-pulse space-y-2"
                aria-busy="true"
                aria-label={`Loading result for ${result.id}`}
              >
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : result.error ? (
              <div
                role="alert"
                className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
              >
                <span className="font-medium">Error:</span> {result.error}
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <pre className="whitespace-pre-wrap break-words text-sm text-gray-800 leading-relaxed">
                  {result.text}
                </pre>
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  {typeof result.latency === "number" ? (
                    <span className="text-xs text-gray-400">
                      Latency: {result.latency} ms
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      result.text != null && handleCopy(result.id, result.text)
                    }
                    disabled={!result.text}
                    className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40"
                    aria-label={`Copy ${result.id} result to clipboard`}
                  >
                    {copiedId === result.id ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
