import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import PromptCard from './PromptCard';
const samplePrompts = [
    { id: '1', title: 'Prompt One', tag: 'General', description: 'First prompt description', prompt: 'Full text of prompt one...' },
    { id: '2', title: 'Prompt Two', tag: 'Medical', description: 'Second prompt description', prompt: 'Full text of prompt two...' },
    { id: '3', title: 'Prompt Three', tag: 'Research', description: 'Third prompt description', prompt: 'Full text of prompt three...' },
    { id: '4', title: 'Prompt Four', tag: 'Analysis', description: 'Fourth prompt description', prompt: 'Full text of prompt four...' },
    { id: '5', title: 'Prompt Five', tag: 'General', description: 'Fifth prompt description', prompt: 'Full text of prompt five...' },
    { id: '6', title: 'Prompt Six', tag: 'Medical', description: 'Sixth prompt description', prompt: 'Full text of prompt six...' },
    { id: '7', title: 'Prompt Seven', tag: 'Research', description: 'Seventh prompt description', prompt: 'Full text of prompt seven...' },
    { id: '8', title: 'Prompt Eight', tag: 'Analysis', description: 'Eighth prompt description', prompt: 'Full text of prompt eight...' },
];
const PromptCardGrid = () => {
    const [selectedId, setSelectedId] = useState('');
    const handleSelect = (id) => {
        setSelectedId(id);
    };
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: samplePrompts.map((p) => (_jsx(PromptCard, { id: p.id, title: p.title, tag: p.tag, description: p.description, prompt: p.prompt, isSelected: p.id === selectedId, onSelect: handleSelect }, p.id))) }));
};
export default PromptCardGrid;
