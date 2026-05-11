import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const LLMResultPanel = ({ results }) => {
    const handleCopy = async (content) => {
        try {
            await navigator.clipboard.writeText(content);
        }
        catch {
            // ignore – UI does not need to fail visibly
        }
    };
    return (_jsx("div", { className: "space-y-4", children: results.map((result) => (_jsx("div", { className: "border rounded p-4 bg-white shadow-sm", children: result.loading ? (_jsxs("div", { className: "animate-pulse space-y-2", children: [_jsx("div", { className: "h-4 bg-gray-300 rounded w-3/4" }), _jsx("div", { className: "h-4 bg-gray-300 rounded w-1/2" })] })) : result.error ? (_jsxs("div", { className: "text-red-600", children: ["Error: ", result.error] })) : (_jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx("pre", { className: "whitespace-pre-wrap break-words", children: result.text }), typeof result.latency === "number" && (_jsxs("div", { className: "text-sm text-gray-500", children: ["Latency: ", result.latency, " ms"] })), _jsx("button", { type: "button", onClick: () => result.text && handleCopy(result.text), className: "self-start px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition", "aria-label": "Copy result to clipboard", children: "Copy" })] })) }, result.id))) }));
};
