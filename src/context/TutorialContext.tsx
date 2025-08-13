import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TutorialContextType {
  isTutorialActive: boolean;
  startTutorial: () => void;
  stopTutorial: () => void;
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  resetTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTutorial = () => {
    setIsTutorialActive(true);
    setCurrentStep(0);
  };

  const stopTutorial = () => {
    setIsTutorialActive(false);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const resetTutorial = () => {
    setCurrentStep(0);
  };

  return (
    <TutorialContext.Provider
      value={{
        isTutorialActive,
        startTutorial,
        stopTutorial,
        currentStep,
        nextStep,
        prevStep,
        resetTutorial
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};