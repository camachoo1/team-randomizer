import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Share2,
  Copy,
  CheckCircle,
  ExternalLink,
  Eye,
  Link,
  Loader2,
} from 'lucide-react';
import useStore from '../store/useStore';
import clsx from 'clsx';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({
  isOpen,
  onClose,
}: ShareModalProps) {
  const {
    teams,
    players,
    eventName,
    organizerName,
    skillCategories,
    skillBalancingEnabled,
  } = useStore();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [shorteningError, setShorteningError] = useState('');

  const generateShareUrl = useCallback(() => {
    // Get saved brackets from localStorage
    const savedBrackets = localStorage.getItem('saved-brackets');
    const brackets = savedBrackets ? JSON.parse(savedBrackets) : [];
    const reservePlayers = players.filter((p) => p.isReserve);

    const shareData = {
      e: eventName,
      o: organizerName,
      t: teams.map((team) => ({
        n: team.name,
        p: team.players.map((player) => ({
          n: player.name,
          ...(player.skillLevel && { s: player.skillLevel }),
        })),
      })),
      // Include reserve players if any exist
      ...(reservePlayers.length > 0 && {
        r: reservePlayers.map((player) => ({
          n: player.name,
          ...(player.skillLevel && { s: player.skillLevel }),
        })),
      }),
      ...(skillBalancingEnabled &&
        skillCategories.length > 0 && {
          sc: skillCategories.map((cat) => ({
            i: cat.id,
            n: cat.name,
            c: cat.color,
          })),
          sb: true,
        }),
      ...(brackets.length > 0 && {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        b: brackets.map((bracket: any) => ({
          i: bracket.id,
          t: bracket.title,
          u: bracket.embedUrl,
        })),
      }),
      ts: Date.now(),
    };

    // Compress and encode the data
    const jsonString = JSON.stringify(shareData);
    const compressed = btoa(jsonString).replace(
      /[+/=]/g,
      (m) => ({ '+': '-', '/': '_', '=': '' }[m] || m)
    );
    const url = `${window.location.origin}${window.location.pathname}#share=${compressed}`;
    return url;
  }, [
    eventName,
    organizerName,
    teams,
    players,
    skillBalancingEnabled,
    skillCategories,
  ]);

  const shortenUrl = async (longUrl: string) => {
    setIsShortening(true);
    setShorteningError('');

    try {
      // TinyURL API - completely free, no API key needed
      const response = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(
          longUrl
        )}`
      );

      if (!response.ok) {
        throw new Error('Failed to shorten URL');
      }

      const shortUrl = await response.text();

      // Validate that we got a proper TinyURL back
      if (shortUrl.startsWith('https://tinyurl.com/')) {
        setShortUrl(shortUrl);
      } else {
        throw new Error('Invalid response from TinyURL');
      }
    } catch (error) {
      console.error('URL shortening failed:', error);
      setShorteningError(
        'Failed to create short URL. You can still use the full link below.'
      );
    } finally {
      setIsShortening(false);
    }
  };

  useEffect(() => {
    if (isOpen && teams.length > 0) {
      const fullUrl = generateShareUrl();
      setShareUrl(fullUrl);
      setShortUrl(''); // Reset short URL
      setShorteningError('');

      // Automatically try to shorten the URL
      shortenUrl(fullUrl);
    }
  }, [isOpen, generateShareUrl, teams]);

  const handleCopy = async (urlToCopy: string) => {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = urlToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenPreview = () => {
    window.open(shareUrl, '_blank');
  };

  const handleClose = useCallback(() => {
    setCopied(false);
    setShortUrl('');
    setShorteningError('');
    onClose();
  }, [onClose]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () =>
        document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Calculate player counts
  const activePlayers = players.filter((p) => !p.isReserve);
  const reservePlayers = players.filter((p) => p.isReserve);
  const totalPlayers = activePlayers.length + reservePlayers.length;

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
      onClick={handleBackdropClick}
    >
      <div className='bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
              <Share2 className='text-primary' size={22} />
            </div>
            <div>
              <h2 className='text-xl font-bold'>Share Teams</h2>
              {shortUrl && (
                <p className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1'>
                  <Link size={12} />
                  Shortened with TinyURL
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-6'>
          {teams.length === 0 ? (
            <div className='text-center py-12'>
              <Share2
                size={48}
                className='mx-auto mb-4 text-gray-300 opacity-50'
              />
              <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                No teams to share
              </h3>
              <p className='text-gray-500 dark:text-gray-400 mb-6'>
                Create some teams first to generate a shareable link.
              </p>
              <button onClick={handleClose} className='btn-primary'>
                Got it
              </button>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Info Section */}
              <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                <div className='flex items-start gap-3'>
                  <Eye
                    size={20}
                    className='text-blue-600 flex-shrink-0 mt-0.5'
                  />
                  <div>
                    <h3 className='font-semibold text-blue-800 dark:text-blue-200 mb-2'>
                      Share your teams with a short link
                    </h3>
                    <ul className='text-blue-700 dark:text-blue-300 space-y-1 text-sm'>
                      <li>
                        • Automatically shortened with TinyURL for
                        easy sharing
                      </li>
                      <li>
                        • Others can view your teams but cannot edit
                        them
                      </li>
                      <li>
                        • Includes team composition, skill categories,
                        and reserves
                      </li>
                      <li>
                        • No account or sign-up required for viewers
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Short URL Section */}
              {(shortUrl || isShortening) && (
                <div>
                  <h3 className='font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2'>
                    <Link size={18} />
                    Short Link:
                    {isShortening && (
                      <Loader2
                        size={14}
                        className='animate-spin text-primary'
                      />
                    )}
                  </h3>

                  {isShortening ? (
                    <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border flex items-center gap-3'>
                      <Loader2
                        size={20}
                        className='animate-spin text-primary'
                      />
                      <span className='text-gray-600 dark:text-gray-400'>
                        Creating short URL with TinyURL...
                      </span>
                    </div>
                  ) : shortUrl ? (
                    <div className='relative'>
                      <div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-4 pr-16 border border-green-200 dark:border-green-800 font-mono text-sm break-all'>
                        {shortUrl}
                      </div>
                      <button
                        onClick={() => handleCopy(shortUrl)}
                        className={clsx(
                          'absolute top-1/2 right-3 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium',
                          'transition-all duration-200 flex items-center gap-2 shadow-sm',
                          copied
                            ? 'bg-green-600 text-white'
                            : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                        )}
                      >
                        {copied ? (
                          <>
                            <CheckCircle size={14} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Error message */}
              {shorteningError && (
                <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800'>
                  <p className='text-yellow-800 dark:text-yellow-200 text-sm'>
                    {shorteningError}
                  </p>
                </div>
              )}

              {/* Share Preview */}
              <div>
                <h3 className='font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                  What others will see:
                </h3>
                <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border'>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Event:
                      </span>
                      <span className='font-medium'>
                        {eventName || 'Untitled Event'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Organizer:
                      </span>
                      <span className='font-medium'>
                        {organizerName || 'Anonymous'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Teams:
                      </span>
                      <span className='font-medium'>
                        {teams.length}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Active Players:
                      </span>
                      <span className='font-medium'>
                        {activePlayers.length}
                      </span>
                    </div>
                    {reservePlayers.length > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600 dark:text-gray-400'>
                          Reserve Players:
                        </span>
                        <span className='font-medium text-orange-600'>
                          {reservePlayers.length}
                        </span>
                      </div>
                    )}
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Total Players:
                      </span>
                      <span className='font-medium text-primary'>
                        {totalPlayers}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full URL (fallback) */}
              {(shorteningError || !shortUrl) && (
                <div>
                  <h3 className='font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                    Full Share Link:
                  </h3>
                  <div className='relative'>
                    <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 pr-16 border font-mono text-sm break-all'>
                      {shareUrl}
                    </div>
                    <button
                      onClick={() => handleCopy(shareUrl)}
                      className={clsx(
                        'absolute top-1/2 right-3 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium',
                        'transition-all duration-200 flex items-center gap-2 shadow-sm',
                        copied
                          ? 'bg-green-600 text-white'
                          : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      )}
                    >
                      {copied ? (
                        <>
                          <CheckCircle size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <button
                  onClick={handleOpenPreview}
                  className='btn-secondary flex items-center gap-2 flex-1'
                >
                  <ExternalLink size={16} />
                  Preview Link
                </button>
                <button
                  onClick={() => handleCopy(shortUrl || shareUrl)}
                  className='btn-primary flex items-center gap-2 flex-1'
                >
                  <Copy size={16} />
                  Copy {shortUrl ? 'Short' : ''} Link
                </button>
              </div>

              {/* Note */}
              <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm'>
                <p className='text-blue-800 dark:text-blue-200'>
                  <strong>How it works:</strong> Your team data is
                  compressed and embedded in the URL. TinyURL creates
                  a short alias that redirects to your full link,
                  making it perfect for sharing on social media or
                  messaging apps.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
