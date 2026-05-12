import React, { useState, useRef, useCallback } from 'react';
import HistoryList, { HistoryEntry } from './HistoryList';

const QueryPane: React.FC = () => {
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [waitingForFirst, setWaitingForFirst] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const updateEntry = useCallback(
    (id: string, patch: Partial<HistoryEntry>) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
      );
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || submitting) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newEntry: HistoryEntry = {
      id,
      question: trimmed,
      answer: '',
      streaming: true,
    };

    setEntries((prev) => [...prev, newEntry]);
    setQuery('');
    setSubmitting(true);
    setWaitingForFirst(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: trimmed }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => String(response.status));
        updateEntry(id, { streaming: false, error: detail || `HTTP ${response.status}` });
        return;
      }

      if (!response.body) {
        updateEntry(id, { streaming: false, error: 'Empty response body' });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          for (const line of part.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const raw = line.slice(5).trim();
            if (raw === '[DONE]') continue;

            let token = raw;
            try {
              const parsed: unknown = JSON.parse(raw);
              if (typeof parsed === 'object' && parsed !== null) {
                const p = parsed as Record<string, unknown>;
                token = String(p.token ?? p.text ?? p.content ?? raw);
              }
            } catch {
              // raw text token — use as-is
            }

            if (waitingForFirst) {
              setWaitingForFirst(false);
            }
            setEntries((prev) =>
              prev.map((e) =>
                e.id === id ? { ...e, answer: e.answer + token } : e
              )
            );
          }
        }
      }

      updateEntry(id, { streaming: false });
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return;
      updateEntry(id, {
        streaming: false,
        error: (err as Error).message || 'Network error',
      });
    } finally {
      setSubmitting(false);
      setWaitingForFirst(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm min-h-[300px]">
        <HistoryList entries={entries} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question… (Ctrl+Enter or ⌘+Enter to submit)"
            rows={3}
            disabled={submitting}
            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 pr-24 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {submitting
              ? waitingForFirst
                ? 'Waiting for response…'
                : 'Streaming…'
              : 'Ctrl+Enter to submit'}
          </span>

          <button
            type="submit"
            disabled={!query.trim() || submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {waitingForFirst ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3V4a8 8 0 00-8 8h4z"
                  />
                </svg>
                Waiting…
              </>
            ) : submitting ? (
              'Streaming…'
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QueryPane;
