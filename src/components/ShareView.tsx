import { useState, useEffect } from 'react';
import {
  Eye,
  Users,
  Calendar,
  Award,
  ArrowLeft,
  Share2,
  Trophy,
  ExternalLink,
} from 'lucide-react';

interface SharedTeam {
  n: string; // name
  p: Array<{
    n: string; // name
    s?: string; // skillLevel
  }>;
}

interface SharedData {
  e: string; // eventName
  o: string; // organizerName
  t: SharedTeam[]; // teams
  s: Array<{
    // skillCategories
    i: string; // id
    n: string; // name
    c: string; // color
  }>;
  sb: boolean; // skillBalancingEnabled
  b: Array<{
    // brackets
    i: string; // id
    t: string; // title
    u: string; // embedUrl
  }>;
  ts: number; // timestamp
}

export default function ShareView() {
  const [sharedData, setSharedData] = useState<SharedData | null>(
    null
  );
  const [error, setError] = useState<string>('');
  const [isShareView, setIsShareView] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedBracket, setSelectedBracket] = useState<any>(null);

  useEffect(() => {
    const checkForShareData = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share=')) {
        setIsShareView(true);
        const encodedData = hash.replace('#share=', '');
        try {
          // Decode URL-safe base64
          const normalizedData = encodedData.replace(
            /[-_]/g,
            (m) => ({ '-': '+', _: '/' }[m] || m)
          );
          const paddedData =
            normalizedData +
            '='.repeat((4 - (normalizedData.length % 4)) % 4);
          const decodedData = atob(paddedData);
          const parsedData = JSON.parse(decodedData) as SharedData;
          setSharedData(parsedData);
          // Set first bracket as selected if any exist
          if (parsedData.b && parsedData.b.length > 0) {
            setSelectedBracket(parsedData.b[0]);
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          setError('Invalid or corrupted share link');
        }
      }
    };

    checkForShareData();
    window.addEventListener('hashchange', checkForShareData);
    return () =>
      window.removeEventListener('hashchange', checkForShareData);
  }, []);

  const getSkillCategoryInfo = (skillCategoryId?: string) => {
    return sharedData?.s.find((cat) => cat.i === skillCategoryId);
  };

  const getSkillCategoryCounts = () => {
    if (!sharedData?.sb || !sharedData?.s) return [];

    return sharedData.s.map((category) => ({
      ...category,
      count: sharedData.t.reduce(
        (total, team) =>
          total + team.p.filter((p) => p.s === category.i).length,
        0
      ),
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTeamSkillDistribution = (teamPlayers: any[]) => {
    if (!sharedData?.sb || !sharedData?.s) return null;

    const distribution = sharedData.s
      .map((category) => ({
        ...category,
        count: teamPlayers.filter((p) => p.s === category.i).length,
      }))
      .filter((cat) => cat.count > 0);

    return distribution;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goToMain = () => {
    window.location.hash = '';
    setIsShareView(false);
  };

  // Don't render if not in share view
  if (!isShareView) {
    return null;
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4'>
        <div className='bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md text-center shadow-xl'>
          <div className='w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Share2 size={32} className='text-red-600' />
          </div>
          <h1 className='text-xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
            Share Link Error
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mb-6'>
            {error}. Please check the link and try again.
          </p>
          <button
            onClick={goToMain}
            className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors'
          >
            Go to Teamify
          </button>
        </div>
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>
            Loading shared teams...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
      {/* Header */}
      <header className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2.5 bg-gradient-to-br from-primary to-rose-500 rounded-xl text-white shadow-lg'>
                <Users size={24} />
              </div>
              <div>
                <h1 className='text-xl font-bold bg-gradient-to-r from-primary to-rose-600 bg-clip-text text-transparent'>
                  Teamify
                </h1>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                  <Eye size={14} />
                  <span>Read-only view</span>
                </div>
              </div>
            </div>
            <button
              onClick={goToMain}
              className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors'
            >
              <ArrowLeft size={16} />
              Create Your Own
            </button>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Event Info Sidebar */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Event Details */}
            <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'>
              <h2 className='text-lg font-bold mb-4 flex items-center gap-2'>
                <Calendar size={20} className='text-primary' />
                Event Details
              </h2>
              <div className='space-y-3'>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Event Name
                  </p>
                  <p className='font-semibold'>
                    {sharedData.e || 'Untitled Event'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Organizer
                  </p>
                  <p className='font-semibold'>
                    {sharedData.o || 'Anonymous'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Created
                  </p>
                  <p className='font-semibold text-sm'>
                    {formatDate(sharedData.ts)}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'>
              <h2 className='text-lg font-bold mb-4 flex items-center gap-2'>
                <Users size={20} className='text-primary' />
                Statistics
              </h2>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Teams
                  </span>
                  <span className='font-bold text-xl'>
                    {sharedData.t.length}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Players
                  </span>
                  <span className='font-bold text-xl'>
                    {sharedData.t.reduce(
                      (total, team) => total + team.p.length,
                      0
                    )}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Avg per team
                  </span>
                  <span className='font-bold text-xl'>
                    {Math.round(
                      sharedData.t.reduce(
                        (total, team) => total + team.p.length,
                        0
                      ) / sharedData.t.length
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Skill Distribution */}
            {sharedData.sb && sharedData.s.length > 0 && (
              <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'>
                <h2 className='text-lg font-bold mb-4 flex items-center gap-2'>
                  <Award size={20} className='text-primary' />
                  Skill Distribution
                </h2>
                <div className='space-y-3'>
                  {getSkillCategoryCounts().map((category) => (
                    <div
                      key={category.i}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{ backgroundColor: category.c }}
                        />
                        <span className='text-sm font-medium'>
                          {category.n}
                        </span>
                      </div>
                      <span className='font-bold'>
                        {category.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brackets List */}
            {sharedData.b && sharedData.b.length > 0 && (
              <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'>
                <h2 className='text-lg font-bold mb-4 flex items-center gap-2'>
                  <Trophy size={20} className='text-primary' />
                  Tournament Brackets
                </h2>
                <div className='space-y-2'>
                  {sharedData.b.map((bracket) => (
                    <div
                      key={bracket.i}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedBracket?.i === bracket.i
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedBracket(bracket)}
                    >
                      <div className='flex-1'>
                        <p className='font-medium text-sm'>
                          {bracket.t}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Teams Display */}
          <div className='lg:col-span-3 space-y-6'>
            <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm min-h-[600px]'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='p-3 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
                  <Users size={24} className='text-primary' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold'>Teams</h2>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {sharedData.t.length} teams • Read-only view
                  </p>
                </div>
              </div>

              {/* Skill Legend */}
              {sharedData.sb && sharedData.s.length > 0 && (
                <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Award size={16} className='text-blue-600' />
                    <h3 className='font-semibold text-blue-900 dark:text-blue-100'>
                      Skill Categories
                    </h3>
                  </div>
                  <div className='flex flex-wrap gap-3'>
                    {sharedData.s.map((category) => (
                      <div
                        key={category.i}
                        className='flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full'
                      >
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{ backgroundColor: category.c }}
                        />
                        <span className='text-sm font-medium'>
                          {category.n}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bracket Display */}
              {selectedBracket && (
                <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-2xl font-bold'>
                      {selectedBracket.t}
                    </h2>
                    <a
                      href={selectedBracket.u.replace('/module', '')}
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
                      src={selectedBracket.u}
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

              {/* Teams Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                {sharedData.t.map((team, index) => {
                  const skillDistribution = getTeamSkillDistribution(
                    team.p
                  );

                  return (
                    <div
                      key={index}
                      className='bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300'
                    >
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='font-bold text-lg'>
                          {team.n}
                        </h3>
                        <span className='text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold'>
                          {team.p.length}{' '}
                          {team.p.length === 1 ? 'player' : 'players'}
                        </span>
                      </div>

                      {/* Team Skill Distribution */}
                      {skillDistribution &&
                        skillDistribution.length > 0 && (
                          <div className='mb-4 flex flex-wrap gap-1'>
                            {skillDistribution.map((skill) => (
                              <div
                                key={skill.i}
                                className='flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-xs'
                              >
                                <div
                                  className='w-2 h-2 rounded-full'
                                  style={{ backgroundColor: skill.c }}
                                />
                                <span className='font-medium'>
                                  {skill.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Players */}
                      <div className='space-y-2'>
                        {team.p.map((player, playerIndex) => {
                          const skillInfo = getSkillCategoryInfo(
                            player.s
                          );

                          return (
                            <div
                              key={playerIndex}
                              className='p-3 bg-white dark:bg-gray-800 rounded-xl flex items-center gap-3'
                            >
                              {skillInfo && (
                                <div
                                  className='w-3 h-3 rounded-full flex-shrink-0'
                                  style={{
                                    backgroundColor: skillInfo.c,
                                  }}
                                  title={skillInfo.n}
                                />
                              )}
                              <span className='font-medium'>
                                {player.n}
                              </span>
                              {skillInfo && (
                                <span
                                  className='text-xs px-2 py-0.5 rounded-full font-medium text-white ml-auto'
                                  style={{
                                    backgroundColor:
                                      skillInfo.c + '80',
                                  }}
                                >
                                  {skillInfo.n}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
