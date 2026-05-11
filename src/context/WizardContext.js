import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState } from 'react';
export const WizardContext = createContext(undefined);
export const WizardProvider = ({ children }) => {
    const [step, setStep] = useState(1);
    const [data, setDataState] = useState({});
    const setData = (key, value) => {
        setDataState((prev) => ({ ...prev, [key]: value }));
    };
    return (_jsx(WizardContext.Provider, { value: { step, setStep, data, setData }, children: children }));
};
