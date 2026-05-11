import React, { createContext, useState, ReactNode } from 'react';

interface WizardState {
  step: number;
  // Add any additional wizard data here
  data: Record<string, unknown>;
}

interface WizardContextProps extends WizardState {
  setStep: (step: number) => void;
  setData: (key: string, value: unknown) => void;
}

export const WizardContext = createContext<WizardContextProps | undefined>(undefined);

interface WizardProviderProps {
  children: ReactNode;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const [step, setStep] = useState<number>(1);
  const [data, setDataState] = useState<Record<string, unknown>>({});

  const setData = (key: string, value: unknown) => {
    setDataState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <WizardContext.Provider value={{ step, setStep, data, setData }}>
      {children}
    </WizardContext.Provider>
  );
};
