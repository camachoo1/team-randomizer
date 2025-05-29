import {
  X,
  ChevronRight,
  ChevronLeft,
  Users,
  Settings,
  Trophy,
  Share2,
} from 'lucide-react';
import { useOnboarding } from '../hooks/useOnboarding';

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingOverlay = ({
  isOpen,
  onClose,
}: OnboardingOverlayProps) => {
  const {
    currentStep,
    currentStepData,
    totalSteps,
    isTransitioning,
    tooltipPosition,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    isFirstStep,
    isLastStep,
  } = useOnboarding(isOpen);

  const handleClose = () => {
    completeTour();
    onClose();
  };

  const handleSkip = () => {
    skipTour();
    onClose();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
    } else {
      nextStep();
    }
  };

  // Get the appropriate icon based on iconType
  const getIcon = () => {
    switch (currentStepData.iconType) {
      case 'users':
        return currentStepData.title === 'Welcome to Teamify!' ? (
          <Users className='w-8 h-8 text-primary' />
        ) : (
          <Users className='w-6 h-6 text-green-600' />
        );
      case 'settings':
        return <Settings className='w-6 h-6 text-blue-600' />;
      case 'trophy':
        return <Trophy className='w-6 h-6 text-orange-600' />;
      case 'share':
        return <Share2 className='w-6 h-6 text-purple-600' />;
      default:
        return <Users className='w-6 h-6 text-primary' />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50'>
      {/* Tooltip */}
      <div
        className={`absolute bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-96 max-w-[90vw] transition-all duration-300 ${
          isTransitioning
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100'
        }`}
        style={tooltipPosition}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className='absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
          aria-label='Close tour'
        >
          <X size={20} className='text-gray-500' />
        </button>

        {/* Content */}
        <div className='mb-6'>
          <div className='flex items-center gap-3 mb-3'>
            {getIcon()}
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
          {Array.from({ length: totalSteps }).map((_, index) => (
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
            {!isFirstStep && (
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
              onClick={handleSkip}
              className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className='flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium'
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
