import React from "react";

interface LLMResult {
  id: string;
  loading: boolean;
  /** Result text when successful */
  text?: string;
  /** Latency in milliseconds */
  latency?: number;
  /** Backend error message when failed */
  error?: string;
}

interface LLMResultPanelProps {
  /** Array of LLM results to display */
  results: LLMResult[];
}

export const LLMResultPanel: React.FC<LLMResultPanelProps> = ({ results }) => {
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // ignore – UI does not need to fail visibly
    }
  };

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div
          key={result.id}
          className="border rounded p-4 bg-white shadow-sm"
        >
          {result.loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ) : result.error ? (
            <div className="text-red-600">Error: {result.error}</div>
          ) : (
            <div className="flex flex-col space-y-2">
              <pre className="whitespace-pre-wrap break-words">{result.text}</pre>
              {typeof result.latency === "number" && (
                <div className="text-sm text-gray-500">Latency: {result.latency} ms</div>
              )}
              <button
                type="button"
                onClick={() => result.text && handleCopy(result.text)}
                className="self-start px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                aria-label="Copy result to clipboard"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
