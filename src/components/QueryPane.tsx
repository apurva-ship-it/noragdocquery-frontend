import React, { useState, useRef, useCallback } from "react";
import HistoryList from "./HistoryList";
import type { QAPair } from "../types";

export default function QueryPane() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const q = question.trim();
      if (!q || loading) return;

      setQuestion("");
      setError(null);
      setLoading(true);

      const pairIndex = history.length;
      setHistory((prev) => [...prev, { question: q, answer: "", streaming: true }]);

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { detail?: string }).detail ?? `Error ${res.status}`);
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No response body");

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data) as { token?: string };
              if (parsed.token) {
                setHistory((prev) =>
                  prev.map((p, i) =>
                    i === pairIndex ? { ...p, answer: p.answer + parsed.token! } : p
                  )
                );
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }

        setHistory((prev) =>
          prev.map((p, i) => (i === pairIndex ? { ...p, streaming: false } : p))
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Query failed";
        setError(msg);
        setHistory((prev) =>
          prev.map((p, i) =>
            i === pairIndex ? { ...p, answer: `Error: ${msg}`, streaming: false } : p
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [question, loading, history.length]
  );

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow h-full">
      <h2 className="text-lg font-semibold text-gray-800">Ask a Question</h2>

      <HistoryList history={history} />

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-auto">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Ask something about your documents… (Enter to send, Shift+Enter for newline)"
          disabled={loading}
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
          aria-label="Question input"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="self-end flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true" />
          )}
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>
    </div>
  );
}
