import { Clock, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';

export default function History() {
  const { history, loadHistoryEntry, clearHistory } = useStore();
  return (
    <div
      className='card animate-fade-in'
      style={{ animationDelay: '0.3s' }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
            <Clock className='text-primary' size={22} />
          </div>
          <h2 className='text-xl font-bold'>History</h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className='p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 
                     rounded-lg transition-all duration-200'
            title='Clear all history'
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
