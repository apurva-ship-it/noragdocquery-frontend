import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext } from 'react';
import { WizardContext } from '../context/WizardContext';
import InputForm from '../components/InputForm';
import PromptCardGrid from '../components/PromptCardGrid';
const STEPS = ['Product Details', 'Select Prompt'];
const WizardPage = () => {
    const wizard = useContext(WizardContext);
    const step = wizard?.step ?? 1;
    return (_jsx("div", { className: "min-h-screen bg-gray-50", children: _jsxs("div", { className: "max-w-5xl mx-auto px-4 py-10", children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-800 mb-6", children: "Pharma GEO Prompt Tool" }), _jsx("nav", { className: "flex gap-2 mb-8", "aria-label": "Wizard steps", children: STEPS.map((label, idx) => {
                        const num = idx + 1;
                        const active = step === num;
                        const done = step > num;
                        return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                    ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`, children: done ? '✓' : num }), _jsx("span", { className: `text-sm ${active ? 'font-medium text-gray-800' : 'text-gray-400'}`, children: label }), idx < STEPS.length - 1 && _jsx("span", { className: "text-gray-300 ml-2", children: "\u203A" })] }, num));
                    }) }), _jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6", children: [step === 1 && _jsx(InputForm, {}), step >= 2 && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-lg font-medium text-gray-700 mb-1", children: "Select a Prompt" }), _jsx("p", { className: "text-sm text-gray-500", children: "Choose the prompt template that best fits your campaign." })] }), _jsx(PromptCardGrid, {})] }))] })] }) }));
};
export default WizardPage;
