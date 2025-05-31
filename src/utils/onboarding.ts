export type TooltipPosition =
  | 'center'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom';

export interface OnboardingStepData {
  title: string;
  description: string;
  iconType: 'users' | 'settings' | 'trophy' | 'share';
  highlight: string | null;
  position: TooltipPosition;
}

export interface OnboardingStep extends OnboardingStepData {
  icon: React.ReactNode;
}

export const ONBOARDING_STEP_DATA: OnboardingStepData[] = [
  {
    title: 'Welcome to Teamify!',
    description:
      "Create balanced teams for tournaments and events with ease. Let's get you started with a quick tour.",
    iconType: 'users',
    highlight: null,
    position: 'center',
  },
  {
    title: '1. Set Up Your Event',
    description:
      'Start by giving your tournament a name and adding organizer details. This helps identify your event.',
    iconType: 'settings',
    highlight: "[data-tour='event-settings']",
    position: 'right',
  },
  {
    title: '2. Add Your Players',
    description:
      'Add players one by one or import from CSV. You can set skill levels for better team balancing.',
    iconType: 'users',
    highlight: "[data-tour='add-players']",
    position: 'right',
  },
  {
    title: '3. Generate Balanced Teams',
    description:
      "Once you have players, use the 'Randomize Teams' button to create balanced teams. Enable skill balancing for fairer matches.",
    iconType: 'trophy',
    highlight: "[data-tour='generate-teams']",
    position: 'left',
  },
  {
    title: '4. Share & Export',
    description:
      'Export your teams for tournament platforms like Challonge, or share them with participants using the share feature.',
    iconType: 'share',
    highlight: "[data-tour='export-share']",
    position: 'left',
  },
];

export const STORAGE_KEY = 'teamify-tour-completed';

export const calculateTooltipPosition = (
  step: OnboardingStepData
): React.CSSProperties => {
  const element = step.highlight
    ? (document.querySelector(step.highlight) as HTMLElement)
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
  const tooltipHeight = 300;
  const padding = 20;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let position: React.CSSProperties = {};

  switch (step.position) {
    case 'right': {
      // Check if there's enough space on the right
      if (rect.right + tooltipWidth + padding < viewportWidth) {
        position = {
          top: `${Math.max(
            padding,
            Math.min(
              viewportHeight - tooltipHeight - padding,
              rect.top + rect.height / 2 - tooltipHeight / 2
            )
          )}px`,
          left: `${rect.right + padding}px`,
          transform: 'none',
        };
      } else {
        // Fall back to left
        position = {
          top: `${Math.max(
            padding,
            Math.min(
              viewportHeight - tooltipHeight - padding,
              rect.top + rect.height / 2 - tooltipHeight / 2
            )
          )}px`,
          left: `${Math.max(
            padding,
            rect.left - tooltipWidth - padding
          )}px`,
          transform: 'none',
        };
      }
      break;
    }

    case 'left': {
      // Special handling for header export buttons
      if (step.highlight === "[data-tour='export-share']") {
        const leftPosition = Math.max(
          padding,
          rect.left - tooltipWidth - 60
        );
        const topPosition = Math.max(
          padding,
          Math.min(
            viewportHeight - tooltipHeight - padding,
            rect.top + rect.height / 2 - tooltipHeight / 2
          )
        );

        position = {
          top: `${topPosition}px`,
          left: `${leftPosition}px`,
          transform: 'none',
        };
      } else {
        // Standard left positioning
        if (rect.left - tooltipWidth - padding > 0) {
          position = {
            top: `${Math.max(
              padding,
              Math.min(
                viewportHeight - tooltipHeight - padding,
                rect.top + rect.height / 2 - tooltipHeight / 2
              )
            )}px`,
            left: `${rect.left - tooltipWidth - padding}px`,
            transform: 'none',
          };
        } else {
          // Fall back to right
          position = {
            top: `${Math.max(
              padding,
              Math.min(
                viewportHeight - tooltipHeight - padding,
                rect.top + rect.height / 2 - tooltipHeight / 2
              )
            )}px`,
            left: `${Math.min(
              viewportWidth - tooltipWidth - padding,
              rect.right + padding
            )}px`,
            transform: 'none',
          };
        }
      }
      break;
    }

    case 'top': {
      const topSpace = rect.top - tooltipHeight - padding;
      if (topSpace > 0) {
        position = {
          top: `${topSpace}px`,
          left: `${Math.max(
            padding,
            Math.min(
              viewportWidth - tooltipWidth - padding,
              rect.left + rect.width / 2 - tooltipWidth / 2
            )
          )}px`,
          transform: 'none',
        };
      } else {
        // Fall back to bottom
        position = {
          top: `${rect.bottom + padding}px`,
          left: `${Math.max(
            padding,
            Math.min(
              viewportWidth - tooltipWidth - padding,
              rect.left + rect.width / 2 - tooltipWidth / 2
            )
          )}px`,
          transform: 'none',
        };
      }
      break;
    }

    case 'bottom': {
      const bottomSpace =
        viewportHeight - rect.bottom - tooltipHeight - padding;
      if (bottomSpace > 0) {
        position = {
          top: `${rect.bottom + padding}px`,
          left: `${Math.max(
            padding,
            Math.min(
              viewportWidth - tooltipWidth - padding,
              rect.left + rect.width / 2 - tooltipWidth / 2
            )
          )}px`,
          transform: 'none',
        };
      } else {
        // Fall back to top
        position = {
          top: `${Math.max(
            padding,
            rect.top - tooltipHeight - padding
          )}px`,
          left: `${Math.max(
            padding,
            Math.min(
              viewportWidth - tooltipWidth - padding,
              rect.left + rect.width / 2 - tooltipWidth / 2
            )
          )}px`,
          transform: 'none',
        };
      }
      break;
    }

    default:
      position = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
  }

  return position;
};

export const smoothScrollToElement = (element: HTMLElement): void => {
  const rect = element.getBoundingClientRect();
  const tooltipHeight = 300;
  const padding = 50;

  const isFullyVisible =
    rect.top >= padding &&
    rect.bottom <= window.innerHeight - tooltipHeight - padding;

  if (!isFullyVisible) {
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const scrollOffset = elementCenter - viewportCenter;

    window.scrollBy({
      top: scrollOffset,
      behavior: 'smooth',
    });
  }
};

export const highlightElement = (selector: string): void => {
  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    element.style.position = 'relative';
    element.style.zIndex = '60';
    element.style.boxShadow =
      '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2)';
    element.style.borderRadius = '12px';

    // Special handling for header buttons
    if (selector === "[data-tour='export-share']") {
      element.style.setProperty(
        'backdrop-filter',
        'none',
        'important'
      );
      element.style.setProperty(
        '-webkit-backdrop-filter',
        'none',
        'important'
      );
      element.style.setProperty(
        'background',
        'rgba(255, 255, 255, 0.95)',
        'important'
      );
      element.style.setProperty('border-radius', '12px', 'important');

      // Create a solid background to completely block the blur behind
      element.style.setProperty(
        'background-color',
        'var(--tw-bg-opacity, 1) rgb(255 255 255)',
        'important'
      );

      const header = element.closest('header') as HTMLElement;
      if (header) {
        header.style.setProperty(
          'backdrop-filter',
          'none',
          'important'
        );
        header.style.setProperty(
          '-webkit-backdrop-filter',
          'none',
          'important'
        );
      }

      const glassHeader = element.closest(
        '.glass-header'
      ) as HTMLElement;
      if (glassHeader) {
        glassHeader.style.setProperty(
          'backdrop-filter',
          'none',
          'important'
        );
        glassHeader.style.setProperty(
          '-webkit-backdrop-filter',
          'none',
          'important'
        );
      }
    } else {
      element.style.backdropFilter = 'none';
    }

    const childElements = element.querySelectorAll(
      '*'
    ) as NodeListOf<HTMLElement>;
    childElements.forEach((child) => {
      if (selector === "[data-tour='export-share']") {
        child.style.setProperty(
          'backdrop-filter',
          'none',
          'important'
        );
        child.style.setProperty(
          '-webkit-backdrop-filter',
          'none',
          'important'
        );
        if (child.tagName === 'BUTTON' || child.tagName === 'SPAN') {
          child.style.setProperty('text-shadow', 'none', 'important');
          child.style.setProperty('filter', 'none', 'important');
        }
      } else {
        child.style.backdropFilter = 'none';
      }
    });
  }
};

export const removeAllHighlights = (
  steps: OnboardingStepData[]
): void => {
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

        // Complete cleanup for header elements
        if (step.highlight === "[data-tour='export-share']") {
          element.style.removeProperty('backdrop-filter');
          element.style.removeProperty('-webkit-backdrop-filter');
          element.style.removeProperty('background');
          element.style.removeProperty('background-color');

          // Restore header blur completely
          const header = element.closest('header') as HTMLElement;
          if (header) {
            header.style.removeProperty('backdrop-filter');
            header.style.removeProperty('-webkit-backdrop-filter');
          }

          const glassHeader = element.closest(
            '.glass-header'
          ) as HTMLElement;
          if (glassHeader) {
            glassHeader.style.removeProperty('backdrop-filter');
            glassHeader.style.removeProperty(
              '-webkit-backdrop-filter'
            );
          }
        } else {
          element.style.backdropFilter = '';
        }

        // Complete child element cleanup
        const childElements = element.querySelectorAll(
          '*'
        ) as NodeListOf<HTMLElement>;
        childElements.forEach((child) => {
          if (step.highlight === "[data-tour='export-share']") {
            child.style.removeProperty('backdrop-filter');
            child.style.removeProperty('-webkit-backdrop-filter');
            child.style.removeProperty('text-shadow');
            child.style.removeProperty('filter');
          } else {
            child.style.backdropFilter = '';
          }
        });
      }
    }
  });
};
