import { useState, useEffect, useCallback } from 'react';
import {
  ONBOARDING_STEP_DATA,
  STORAGE_KEY,
  calculateTooltipPosition,
  smoothScrollToElement,
  highlightElement,
  removeAllHighlights,
} from '../utils/onboarding';

export const useOnboarding = (isOpen: boolean) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tooltipPosition, setTooltipPosition] =
    useState<React.CSSProperties>({
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    });

  // Handle element highlighting and positioning
  const processStep = useCallback(() => {
    removeAllHighlights(ONBOARDING_STEP_DATA);
    const step = ONBOARDING_STEP_DATA[currentStep];

    if (step.highlight) {
      const element = document.querySelector(
        step.highlight
      ) as HTMLElement;
      if (element) {
        smoothScrollToElement(element);

        setTimeout(() => {
          highlightElement(step.highlight!);

          const newPosition = calculateTooltipPosition(step);
          setTooltipPosition(newPosition);

          setIsTransitioning(false);
        }, 400);
      } else {
        setTooltipPosition({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        });
        setIsTransitioning(false);
      }
    } else {
      setTooltipPosition({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }
  }, [currentStep]);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (currentStep < ONBOARDING_STEP_DATA.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 150);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 150);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  // Handle scroll prevention and step processing
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflowX = 'hidden';
      processStep();
    } else {
      document.body.style.overflowX = 'unset';
      removeAllHighlights(ONBOARDING_STEP_DATA);
    }

    return () => {
      document.body.style.overflowX = 'unset';
      removeAllHighlights(ONBOARDING_STEP_DATA);
    };
  }, [isOpen, currentStep, processStep]);

  return {
    currentStep,
    currentStepData: ONBOARDING_STEP_DATA[currentStep],
    totalSteps: ONBOARDING_STEP_DATA.length,
    isTransitioning,
    tooltipPosition,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === ONBOARDING_STEP_DATA.length - 1,
  };
};
