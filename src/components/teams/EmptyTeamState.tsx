import { Users, Sparkles } from 'lucide-react';

interface EmptyTeamsStateProps {
  skillBalancingEnabled: boolean;
}

export default function EmptyTeamsState({
  skillBalancingEnabled,
}: EmptyTeamsStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-24'>
      <div className='relative mb-6'>
        <Users
          size={80}
          className='text-gray-300 dark:text-gray-700'
        />
        <Sparkles
          size={32}
          className='absolute -top-4 -right-4 text-primary animate-pulse-subtle'
        />
      </div>
      <h3 className='text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2'>
        No teams created yet
      </h3>
      <p className='text-gray-500 dark:text-gray-400 text-center max-w-md'>
        Add some players and click "Randomize Teams" to automatically
        create {skillBalancingEnabled ? 'skill-balanced' : 'balanced'}{' '}
        teams
      </p>
    </div>
  );
}
