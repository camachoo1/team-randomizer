import { useState } from 'react';
import useStore from '../store/useStore';
import { Trophy } from 'lucide-react';

export default function BulkExport() {
  const { teams, eventName } = useStore();
  const [copied, setCopied] = useState(false);
  const [includePlayerNames, setIncludePlayerNames] = useState(false);

  return (
    <div>
      <div>
        <div>
          <Trophy className='text-primary' size={22} />
        </div>
      </div>
    </div>
  );
}
