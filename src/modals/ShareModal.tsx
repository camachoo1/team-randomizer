import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Share2,
  Copy,
  CheckCircle,
  ExternalLink,
  Eye,
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
    eventName,
    organizerName,
    skillCategories,
    skillBalancingEnabled,
  } = useStore();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const generateShareUrl = useCallback(() => {
    // Get saved brackets from localStorage
    const savedBrackets = localStorage.getItem('saved-brackets');
    const brackets = savedBrackets ? JSON.parse(savedBrackets) : [];

    const shareData = {
      e: eventName, // shortened keys
      o: organizerName,
      t: teams.map((team) => ({
        n: team.name,
        p: team.players.map((player) => ({
          n: player.name,
          s: player.skillLevel,
        })),
      })),
      s: skillBalancingEnabled
        ? skillCategories.map((cat) => ({
            i: cat.id,
            n: cat.name,
            c: cat.color,
          }))
        : [],
      sb: skillBalancingEnabled,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      b: brackets.map((bracket: any) => ({
        // Add brackets
        i: bracket.id,
        t: bracket.title,
        u: bracket.embedUrl,
      })),
      ts: new Date().getTime(), // timestamp as number
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
    skillBalancingEnabled,
    skillCategories,
  ]);

  useEffect(() => {
    if (isOpen && teams.length > 0) {
      setShareUrl(generateShareUrl());
    }
  }, [isOpen, generateShareUrl, teams]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
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
    onClose();
  }, [setCopied, onClose]);

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
            <h2 className='text-xl font-bold'>Share Teams</h2>
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
                      Create a read-only share link
                    </h3>
                    <ul className='text-blue-700 dark:text-blue-300 space-y-1 text-sm'>
                      <li>
                        • Others can view your teams but cannot edit
                        them
                      </li>
                      <li>
                        • Link includes team composition and skill
                        categories
                      </li>
                      <li>
                        • No account or sign-up required for viewers
                      </li>
                      <li>
                        • Link works as long as you don't change your
                        teams
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

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
                        Players:
                      </span>
                      <span className='font-medium'>
                        {teams.reduce(
                          (total, team) =>
                            total + team.players.length,
                          0
                        )}
                      </span>
                    </div>
                    {skillBalancingEnabled && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600 dark:text-gray-400'>
                          Skill Categories:
                        </span>
                        <span className='font-medium'>
                          {skillCategories.length}
                        </span>
                      </div>
                    )}
                    {(() => {
                      const savedBrackets =
                        localStorage.getItem('saved-brackets');
                      const brackets = savedBrackets
                        ? JSON.parse(savedBrackets)
                        : [];
                      return (
                        brackets.length > 0 && (
                          <div className='flex justify-between'>
                            <span className='text-gray-600 dark:text-gray-400'>
                              Brackets:
                            </span>
                            <span className='font-medium'>
                              {brackets.length}
                            </span>
                          </div>
                        )
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Share URL */}
              <div>
                <h3 className='font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                  Share Link:
                </h3>
                <div className='relative'>
                  <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border font-mono text-sm break-all'>
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={clsx(
                      'absolute top-3 right-3 px-3 py-2 rounded-lg text-sm font-medium',
                      'transition-all duration-200 flex items-center gap-2 shadow-sm',
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                    )}
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

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
                  onClick={handleCopy}
                  className='btn-primary flex items-center gap-2 flex-1'
                >
                  <Copy size={16} />
                  Copy Link
                </button>
              </div>

              {/* Warning */}
              <div className='p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 text-sm'>
                <p className='text-yellow-800 dark:text-yellow-200'>
                  <strong>Note:</strong> This link contains your team
                  data. If you make changes to your teams, you'll need
                  to generate a new share link for others to see the
                  updates.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
