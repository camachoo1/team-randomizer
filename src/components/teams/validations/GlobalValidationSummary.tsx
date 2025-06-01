import { CheckCircle, AlertTriangle } from 'lucide-react';
import useStore from '../../../store/useStore';
import { validateTeamComposition } from '../../../utils/helper';

export const GlobalValidationSummary = () => {
  const {
    teams,
    players,
    skillCategories,
    teamCompositionRules,
    skillBalancingEnabled,
    manualTeamMode,
  } = useStore();

  // Only show in manual mode with skill balancing enabled
  if (
    !manualTeamMode ||
    !skillBalancingEnabled ||
    Object.keys(teamCompositionRules).length === 0
  ) {
    return null;
  }

  const allValidations = teams.map((team) => ({
    team,
    validation: validateTeamComposition(
      team,
      players,
      skillCategories,
      teamCompositionRules,
      skillBalancingEnabled
    ),
  }));

  const invalidTeams = allValidations.filter(
    (t) => !t.validation.isValid
  );
  const totalViolations = invalidTeams.reduce(
    (sum, t) => sum + t.validation.violations.length,
    0
  );

  if (invalidTeams.length === 0 && teams.length > 0) {
    return (
      <div className='mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <CheckCircle className='text-green-500' size={20} />
            <div className='absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping' />
          </div>
          <div>
            <p className='text-sm font-medium text-green-800 dark:text-green-200'>
              Perfect! All {teams.length} teams meet composition
              requirements
            </p>
            <p className='text-xs text-green-700 dark:text-green-300 mt-1'>
              Your tournament is ready to go
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (invalidTeams.length > 0) {
    return (
      <div className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
        <div className='flex items-start gap-3'>
          <div className='relative'>
            <AlertTriangle
              className='text-red-500 flex-shrink-0 mt-0.5'
              size={20}
            />
            <div className='absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping' />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-medium text-red-800 dark:text-red-200'>
              {invalidTeams.length} of {teams.length} teams need
              attention
            </p>
            <p className='text-xs text-red-700 dark:text-red-300 mt-1 mb-3'>
              {totalViolations} composition issue
              {totalViolations !== 1 ? 's' : ''} found - check teams
              with red borders below
            </p>

            <div className='space-y-2'>
              {invalidTeams
                .slice(0, 3)
                .map(({ team, validation }) => (
                  <div key={team.id} className='text-xs'>
                    <span className='font-medium text-red-800 dark:text-red-200'>
                      {team.name}:
                    </span>
                    <span className='text-red-700 dark:text-red-300 ml-1'>
                      {validation.violations[0]}
                      {validation.violations.length > 1 &&
                        ` (+${
                          validation.violations.length - 1
                        } more)`}
                    </span>
                  </div>
                ))}
              {invalidTeams.length > 3 && (
                <p className='text-xs text-red-600 dark:text-red-400 italic'>
                  ...and {invalidTeams.length - 3} more teams
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
