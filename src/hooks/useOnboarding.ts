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
        // Scroll to element first
        smoothScrollToElement(element);

        // Wait for scroll completion, then highlight and position
        setTimeout(() => {
          highlightElement(step.highlight!);

          // Calculate position AFTER scroll is complete
          const newPosition = calculateTooltipPosition(step);
          setTooltipPosition(newPosition);

          // Fade back in
          setIsTransitioning(false);
        }, 400); // Reduced from 500ms for snappier feel
      } else {
        // Element not found, use center position
        setTooltipPosition({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        });
        setIsTransitioning(false);
      }
    } else {
      // Center positioned steps (welcome, final) - no scroll needed
      setTooltipPosition({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      // Quick fade in for center steps
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }
  }, [currentStep]);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (currentStep < ONBOARDING_STEP_DATA.length - 1) {
      // Fade out immediately, then change step
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 150); // Quick fade out
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      // Fade out immediately, then change step
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 150); // Quick fade out
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
