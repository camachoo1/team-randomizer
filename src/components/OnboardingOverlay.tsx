import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Users,
  Settings,
  Trophy,
  Share2,
} from 'lucide-react';

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingOverlay = ({
  isOpen,
  onClose,
}: OnboardingOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = useMemo(
    () => [
      {
        title: 'Welcome to Teamify!',
        description:
          "Create balanced teams for tournaments and events with ease. Let's get you started with a quick tour.",
        icon: <Users className='w-8 h-8 text-primary' />,
        highlight: null,
        position: 'center',
      },
      {
        title: '1. Set Up Your Event',
        description:
          'Start by giving your tournament a name and adding organizer details. This helps identify your event.',
        icon: <Settings className='w-6 h-6 text-blue-600' />,
        highlight: "[data-tour='event-settings']",
        position: 'right',
      },
      {
        title: '2. Add Your Players',
        description:
          'Add players one by one or import from CSV. You can set skill levels for better team balancing.',
        icon: <Users className='w-6 h-6 text-green-600' />,
        highlight: "[data-tour='add-players']",
        position: 'left',
      },
      {
        title: '3. Generate Balanced Teams',
        description:
          "Once you have players, use the 'Randomize Teams' button to create balanced teams. Enable skill balancing for fairer matches.",
        icon: <Trophy className='w-6 h-6 text-orange-600' />,
        highlight: "[data-tour='generate-teams']",
        position: 'left',
      },
      {
        title: '4. Share & Export',
        description:
          'Export your teams for tournament platforms like Challonge, or share them with participants using the share feature.',
        icon: <Share2 className='w-6 h-6 text-purple-600' />,
        highlight: "[data-tour='export-share']",
        position: 'center',
      },
    ],
    []
  );

  const removeHighlight = useCallback(() => {
    steps.forEach((step) => {
      if (step.highlight) {
        const element = document.querySelector(
          step.highlight
        ) as HTMLElement;
        if (element) {
          element.style.position = '';
          element.style.zIndex = '';
          element.style.boxShadow = '';
          element.style.borderRadius = '';
        }
      }
    });
  }, [steps]);

  const highlightElement = useCallback(() => {
    removeHighlight();
    const step = steps[currentStep];
    if (step.highlight) {
      const element = document.querySelector(
        step.highlight
      ) as HTMLElement;
      if (element) {
        element.style.position = 'relative';
        element.style.zIndex = '60';
        element.style.boxShadow =
          '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2)';
        element.style.borderRadius = '12px';
      }
    }
  }, [currentStep, removeHighlight, steps]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Highlight the current step's element
      highlightElement();
    } else {
      document.body.style.overflow = 'unset';
      removeHighlight();
    }

    return () => {
      document.body.style.overflow = 'unset';
      removeHighlight();
    };
  }, [isOpen, currentStep, highlightElement, removeHighlight]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    removeHighlight();
    onClose();
    // Remember that user has seen the tour
    localStorage.setItem('teamify-tour-completed', 'true');
  };

  const skipTour = () => {
    handleClose();
  };

  const getTooltipPosition = () => {
    const step = steps[currentStep];
    const element = step.highlight
      ? document.querySelector(step.highlight)
      : null;

    if (!element || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 400;
    const tooltipHeight = 200;

    let position = {};

    switch (step.position) {
      case 'right':
        position = {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`,
          transform: 'translateY(-50%)',
        };
        break;
      case 'left':
        position = {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - tooltipWidth - 20}px`,
          transform: 'translateY(-50%)',
        };
        break;
      case 'bottom':
        position = {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
        break;
      case 'top':
        position = {
          top: `${rect.top - tooltipHeight - 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
        break;
      default:
        position = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }

    return position;
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center'>
      {/* Tooltip */}
      <div
        className='absolute bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-96 max-w-[90vw]'
        style={getTooltipPosition()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className='absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
        >
          <X size={20} className='text-gray-500' />
        </button>

        {/* Content */}
        <div className='mb-6'>
          <div className='flex items-center gap-3 mb-3'>
            {currentStepData.icon}
            <h3 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
              {currentStepData.title}
            </h3>
          </div>
          <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
            {currentStepData.description}
          </p>
        </div>

        {/* Progress indicators */}
        <div className='flex justify-center gap-2 mb-6'>
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-primary'
                  : index < currentStep
                  ? 'bg-primary/60'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className='flex items-center justify-between'>
          <div className='flex gap-2'>
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className='flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}
          </div>

          <div className='flex gap-2'>
            <button
              onClick={skipTour}
              className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
            >
              Skip Tour
            </button>
            <button
              onClick={nextStep}
              className='flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium'
            >
              {currentStep === steps.length - 1
                ? 'Get Started'
                : 'Next'}
              {currentStep < steps.length - 1 && (
                <ChevronRight size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
