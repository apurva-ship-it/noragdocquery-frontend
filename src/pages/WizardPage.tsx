import React, { useContext, useState } from 'react';
import { WizardContext } from '../context/WizardContext';
import InputForm from '../components/InputForm';
import PromptCardGrid from '../components/PromptCardGrid';
import { LLMResultPanel, LLMResult } from '../components/LLMResultPanel';
import ResponsiveLayout from '../components/ResponsiveLayout';

const STEPS = ['Product Details', 'Select Prompt'];

const WizardPage: React.FC = () => {
  const wizard = useContext(WizardContext);
  const step = wizard?.step ?? 1;
  const [results, setResults] = useState<LLMResult[]>([]);

  const handlePromptSelect = (id: string) => {
    setResults([{ id: `Prompt ${id}`, loading: true }]);
    setTimeout(() => {
      setResults([
        {
          id: `Prompt ${id}`,
          loading: false,
          text: `Generated response for prompt ${id} based on your product details.`,
          latency: Math.floor(Math.random() * 800) + 200,
        },
      ]);
    }, 1500);
  };

  const leftPane = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {step === 1 && <InputForm />}
      {step >= 2 && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-700 mb-1">Select a Prompt</h2>
            <p className="text-sm text-gray-500">Choose the prompt template that best fits your campaign.</p>
          </div>
          <PromptCardGrid onSelect={handlePromptSelect} />
        </>
      )}
    </div>
  );

  const rightPane = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-700 mb-4">Results</h2>
      {results.length === 0 ? (
        <p className="text-sm text-gray-400">Select a prompt to see results here.</p>
      ) : (
        <LLMResultPanel results={results} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Pharma GEO Prompt Tool</h1>

        <nav className="flex gap-2 mb-8" aria-label="Wizard steps">
          {STEPS.map((label, idx) => {
            const num = idx + 1;
            const active = step === num;
            const done = step > num;
            return (
              <div key={num} className="flex items-center gap-2">
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                    ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  {done ? '✓' : num}
                </span>
                <span className={`text-sm ${active ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
                  {label}
                </span>
                {idx < STEPS.length - 1 && <span className="text-gray-300 ml-2">›</span>}
              </div>
            );
          })}
        </nav>

        <ResponsiveLayout left={leftPane} right={rightPane} />
      </div>
    </div>
  );
};

export default WizardPage;
