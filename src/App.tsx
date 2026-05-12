import React from "react";
import ResponsiveLayout from "./components/ResponsiveLayout";
import UploadPane from "./components/UploadPane";
import QueryPane from "./components/QueryPane";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm px-6 py-3 flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">noRAGDocQuery</h1>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          LLM Wiki · No Vector DB · No Login
        </span>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        <ResponsiveLayout
          left={<UploadPane />}
          right={<QueryPane />}
        />
      </main>
    </div>
  );
}
