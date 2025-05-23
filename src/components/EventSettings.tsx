import React from 'react';
import { Calendar, User, Sparkles, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useStore from '../store/useStore';
import clsx from 'clsx';

interface EventForm {
  eventName: string;
  organizerName: string;
}

const EventSettings: React.FC = () => {
  const { eventName, organizerName, setEventInfo } = useStore();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm<EventForm>({
    defaultValues: {
      eventName,
      organizerName,
    },
  });

  const onSubmit = (data: EventForm) => {
    setEventInfo(data.eventName, data.organizerName);
  };

  return (
    <div className='card animate-fade-in'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
          <Sparkles className='text-primary' size={22} />
        </div>
        <h2 className='text-xl font-bold'>Event Settings</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        <div>
          <label className='flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300'>
            <Calendar size={16} />
            Event Name
          </label>
          <input
            {...register('eventName')}
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
            {...register('organizerName')}
            className='input-field'
            placeholder='John Doe'
          />
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className={clsx(
            'btn-primary w-full flex items-center justify-center gap-2',
            isSubmitSuccessful && 'bg-green-600 hover:bg-green-700'
          )}
        >
          <Save size={18} />
          {isSubmitSuccessful ? 'Saved!' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default EventSettings;
