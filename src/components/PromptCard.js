import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const PromptCard = ({ id, title, tag, description, prompt, isSelected, onSelect, }) => {
    const [expanded, setExpanded] = useState(false);
    const handleSelect = () => {
        onSelect(id);
    };
    return (_jsxs("div", { className: `p-4 rounded shadow cursor-pointer transition-colors ${isSelected ? 'border-2 border-blue-500' : 'border border-gray-200'}`, onClick: handleSelect, role: "button", "aria-pressed": isSelected, children: [_jsx("h3", { className: "text-lg font-semibold mb-1", children: title }), _jsx("span", { className: "inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mr-2", children: tag }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: description }), expanded && (_jsx("pre", { className: "bg-gray-100 p-2 rounded text-sm overflow-x-auto mb-2 whitespace-pre-wrap", children: prompt })), _jsx("button", { type: "button", className: "mt-2 text-blue-600 hover:underline text-sm", onClick: (e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                }, "aria-expanded": expanded, children: expanded ? 'Hide Prompt' : 'Show Prompt' })] }));
};
export default PromptCard;
