import { useState } from 'react';
import useStore from '../store/useStore';
import { Trophy } from 'lucide-react';

export default function BulkExport() {
  const { teams, eventName } = useStore();
  const [copied, setCopied] = useState(false);
  const [includePlayerNames, setIncludePlayerNames] = useState(false);

  return (
    <div
      className='card animate-fade-in'
      style={{ animationDelay: '0.5s' }}
    >
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
          <Trophy className='text-primary' size={22} />
        </div>
        <h2 className='text-xl font-bold'>Export for Challonge</h2>
      </div>
    </div>
  );
}
