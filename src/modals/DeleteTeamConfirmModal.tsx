import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface DeleteTeamConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  teamId: number;
}

export default function DeleteTeamConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteTeamConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () =>
        document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4'>
        <div className='flex gap-3 mb-4'>
          <AlertCircle
            className='text-red-600 flex-shrink-0 mt-0.5'
            size={20}
          />
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
              Delete team?
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
              This will delete the team and unassign all players.
            </p>
          </div>
        </div>
        <div className='flex gap-2 justify-end'>
          <button onClick={onClose} className='btn-ghost'>
            Cancel
          </button>
          <button onClick={onConfirm} className='btn-danger'>
            Delete Team
          </button>
        </div>
      </div>
    </div>
  );
}
