import React, { useState } from 'react';

export interface PromptCardProps {
  id: string;
  title: string;
  tag: string;
  description: string;
  prompt: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({
  id,
  title,
  tag,
  description,
  prompt,
  isSelected,
  onSelect,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleSelect = () => {
    onSelect(id);
  };

  return (
    <div
      className={`p-4 rounded shadow cursor-pointer transition-colors ${
        isSelected ? 'border-2 border-blue-500' : 'border border-gray-200'
      }`}
      onClick={handleSelect}
      role="button"
      aria-pressed={isSelected}
    >
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mr-2">
        {tag}
      </span>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      {expanded && (
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto mb-2 whitespace-pre-wrap">
          {prompt}
        </pre>
      )}
      <button
        type="button"
        className="mt-2 text-blue-600 hover:underline text-sm"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        aria-expanded={expanded}
      >
        {expanded ? 'Hide Prompt' : 'Show Prompt'}
      </button>
    </div>
  );
};

export default PromptCard;
