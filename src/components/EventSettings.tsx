import { useState, useEffect } from 'react';
import { Calendar, User, Sparkles, Save } from 'lucide-react';
import useStore from '../store/useStore';

const EventSettings: React.FC = () => {
  const { eventName, organizerName, setEventInfo } = useStore();
  const [localEvent, setLocalEvent] = useState(eventName);
  const [localOrganizer, setLocalOrganizer] = useState(organizerName);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalEvent(eventName);
    setLocalOrganizer(organizerName);
  }, [eventName, organizerName]);

  const handleSave = () => {
    setEventInfo(localEvent, localOrganizer);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className='card animate-fade-in'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
          <Sparkles className='text-primary' size={22} />
        </div>
        <h2 className='text-xl font-bold'>Event Settings</h2>
      </div>

      <div className='space-y-5'>
        <div>
          <label className='flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300'>
            <Calendar size={16} />
            Event Name
          </label>
          <input
            type='text'
            value={localEvent}
            onChange={(e) => setLocalEvent(e.target.value)}
            className='input-field'
            placeholder='Summer Tournament 2024'
          />
        </div>

        <div>
          <label className='flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300'>
            <User size={16} />
            Organizer Name
          </label>
          <input
            type='text'
            value={localOrganizer}
            onChange={(e) => setLocalOrganizer(e.target.value)}
            className='input-field'
            placeholder='John Doe'
          />
        </div>

        <button
          onClick={handleSave}
          className='btn-primary w-full flex items-center justify-center gap-2'
        >
          {saved ? (
            <>
              <Save size={18} />
              Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
};

export default EventSettings;
