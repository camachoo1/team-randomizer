import clsx from 'clsx';

interface ValidationStatusProps {
  isValid: boolean;
  violations: string[];
  className?: string;
}

export const ValidationStatus = ({
  isValid,
  violations,
  className,
}: ValidationStatusProps) => {
  if (violations.length === 0) return null;

  return (
    <div className={clsx('relative', className)}>
      <div
        className={clsx(
          'w-3 h-3 rounded-full transition-all duration-200',
          isValid
            ? 'bg-green-500 shadow-green-500/30 shadow-lg'
            : 'bg-red-500 animate-pulse shadow-red-500/30 shadow-lg'
        )}
        title={
          isValid
            ? 'Team composition is valid'
            : violations.join(', ')
        }
      />
      {!isValid && (
        <div className='absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping' />
      )}
    </div>
  );
};
