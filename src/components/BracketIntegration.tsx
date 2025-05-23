import React, { useState } from 'react';
import { Trophy, Plus, X, ExternalLink, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';

interface BracketForm {
  embedUrl: string;
  title: string;
}

interface SavedBracket {
  id: string;
  title: string;
  embedUrl: string;
  timestamp: string;
}

export default function BracketIntegration() {
  const [brackets, setBrackets] = useState<SavedBracket[]>(() => {
    const saved = localStorage.getItem('saved-brackets');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBracket, setSelectedBracket] =
    useState<SavedBracket | null>(
      brackets.length > 0 ? brackets[0] : null
    );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BracketForm>();

  const extractChallongeId = (input: string): string | null => {
    // Handle full URLs like https://challonge.com/huc8sajc
    const urlMatch = input.match(/challonge\.com\/([a-zA-Z0-9]+)/);
    if (urlMatch) return urlMatch[1];

    // Handle embed codes
    const embedMatch = input.match(
      /challonge\.com\/([a-zA-Z0-9]+)\/module/
    );
    if (embedMatch) return embedMatch[1];

    // Handle just the ID
    if (/^[a-zA-Z0-9]+$/.test(input)) return input;

    return null;
  };

  const onSubmit = (data: BracketForm) => {
    const tournamentId = extractChallongeId(data.embedUrl);
    if (!tournamentId) return;

    const newBracket: SavedBracket = {
      id: Date.now().toString(),
      title: data.title,
      embedUrl: `https://challonge.com/${tournamentId}/module`,
      timestamp: new Date().toISOString(),
    };

    const updatedBrackets = [...brackets, newBracket];
    setBrackets(updatedBrackets);
    localStorage.setItem(
      'saved-brackets',
      JSON.stringify(updatedBrackets)
    );

    setSelectedBracket(newBracket);
    setShowAddForm(false);
    reset();
  };

  const deleteBracket = (id: string) => {
    const updatedBrackets = brackets.filter((b) => b.id !== id);
    setBrackets(updatedBrackets);
    localStorage.setItem(
      'saved-brackets',
      JSON.stringify(updatedBrackets)
    );

    if (selectedBracket?.id === id) {
      setSelectedBracket(updatedBrackets[0] || null);
    }
  };

  return (
    <>
      {/* Bracket List Card */}
      <div
        className='card animate-fade-in'
        style={{ animationDelay: '0.6s' }}
      >
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
              <Trophy className='text-primary' size={22} />
            </div>
            <h2 className='text-xl font-bold'>Tournament Brackets</h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={clsx(
              'p-2 rounded-lg transition-all duration-200',
              showAddForm
                ? 'bg-red-100 dark:bg-red-900/20 text-red-600'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {showAddForm ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-slide-up'
          >
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300'>
                  Bracket Name
                </label>
                <input
                  {...register('title', {
                    required: 'Please enter a name',
                  })}
                  className='input-field'
                  placeholder='Main Tournament'
                />
                {errors.title && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300'>
                  Challonge URL or Embed Code
                </label>
                <input
                  {...register('embedUrl', {
                    required: 'Please enter a URL or embed code',
                    validate: (value) =>
                      extractChallongeId(value) !== null ||
                      'Invalid Challonge URL or embed code',
                  })}
                  className='input-field'
                  placeholder='https://challonge.com/huc8sajc or embed code'
                />
                {errors.embedUrl && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.embedUrl.message}
                  </p>
                )}
                <p className='text-xs text-gray-500 mt-1'>
                  Paste the tournament URL or the embed iframe code
                  from Challonge
                </p>
              </div>

              <button type='submit' className='btn-primary w-full'>
                Add Bracket
              </button>
            </div>
          </form>
        )}

        {brackets.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            <Trophy size={32} className='mx-auto mb-2 opacity-30' />
            <p className='text-sm'>No brackets added yet</p>
            <p className='text-xs mt-1'>
              Click the + button to add a Challonge bracket
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {brackets.map((bracket) => (
              <div
                key={bracket.id}
                className={clsx(
                  'flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200',
                  selectedBracket?.id === bracket.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
                onClick={() => setSelectedBracket(bracket)}
              >
                <div className='flex-1'>
                  <p className='font-medium'>{bracket.title}</p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Added{' '}
                    {new Date(bracket.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBracket(bracket.id);
                  }}
                  className='p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 
                           rounded-lg transition-all duration-200'
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
          <div className='flex items-start gap-2'>
            <Info
              size={16}
              className='text-blue-600 flex-shrink-0 mt-0.5'
            />
            <div className='text-xs text-blue-700 dark:text-blue-300'>
              <p className='font-semibold mb-1'>
                How to get your bracket:
              </p>
              <ol className='list-decimal list-inside space-y-0.5'>
                <li>Go to your Challonge tournament</li>
                <li>Click "Share" → "Embed"</li>
                <li>Copy the URL or embed code</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Bracket Display */}
      {selectedBracket && (
        <div
          className='card animate-fade-in lg:col-span-2'
          style={{ animationDelay: '0.3s' }}
        >
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold'>
              {selectedBracket.title}
            </h2>
            <a
              href={selectedBracket.embedUrl.replace('/module', '')}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 text-sm text-primary hover:underline'
            >
              View on Challonge
              <ExternalLink size={14} />
            </a>
          </div>

          <div className='bg-gray-50 dark:bg-gray-900 rounded-xl p-2 -mx-2'>
            <iframe
              src={selectedBracket.embedUrl}
              width='100%'
              height='600'
              frameBorder='0'
              scrolling='auto'
              allowTransparency={true}
              className='rounded-lg'
            />
          </div>
        </div>
      )}
    </>
  );
}
