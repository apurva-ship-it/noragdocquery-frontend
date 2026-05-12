import React, { useEffect, useRef } from 'react';

export interface HistoryEntry {
  id: string;
  question: string;
  answer: string;
  streaming: boolean;
  error?: string;
}

interface HistoryListProps {
  entries: HistoryEntry[];
}

const HistoryList: React.FC<HistoryListProps> = ({ entries }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-gray-400 text-sm">
        Ask a question to get started.
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-y-auto">
      {entries.map((entry) => (
        <div key={entry.id} className="space-y-2">
          <div className="flex items-start gap-3">
            <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              Q
            </span>
            <p className="text-sm font-medium text-gray-800 leading-relaxed">
              {entry.question}
            </p>
          </div>

          <div className="flex items-start gap-3 pl-1">
            <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center">
              A
            </span>
            <div className="flex-1 min-w-0">
              {entry.error ? (
                <div
                  role="alert"
                  className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
                >
                  <span className="font-medium">Error:</span> {entry.error}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words text-sm text-gray-700 leading-relaxed font-sans">
                  {entry.answer}
                  {entry.streaming && (
                    <span className="inline-block w-0.5 h-4 bg-gray-700 ml-0.5 animate-pulse align-text-bottom" />
                  )}
                </pre>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default HistoryList;
