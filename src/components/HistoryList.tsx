import type { QAPair } from "../types";

interface HistoryListProps {
  history: QAPair[];
}

export default function HistoryList({ history }: HistoryListProps) {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
      {history.map((pair, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          <div className="bg-blue-50 rounded-lg px-3 py-2 text-sm text-blue-900 self-end max-w-[85%]">
            <span className="font-medium">Q: </span>{pair.question}
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-800 self-start max-w-[95%] whitespace-pre-wrap">
            <span className="font-medium text-gray-500">A: </span>
            {pair.answer || (pair.streaming ? <span className="animate-pulse text-gray-400">…</span> : "")}
          </div>
        </div>
      ))}
    </div>
  );
}
