import React, { useCallback, useEffect } from 'react';
import {
  Download,
  FileDown,
  CheckCircle,
  XCircle,
  FileText,
  X,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import useStore from '../store/useStore';
import clsx from 'clsx';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportExportModal({
  isOpen,
  onClose,
}: ImportExportModalProps) {
  const {
    eventName,
    exportConfiguration,
    importConfiguration,
    teams,
  } = useStore();
  const [status, setStatus] = React.useState<
    'idle' | 'success' | 'error'
  >('idle');

  const handleExport = () => {
    const jsonData = exportConfiguration();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const fileName = `teams-${eventName || 'config'}-${
      new Date().toISOString().split('T')[0]
    }.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string;
          const success = importConfiguration(jsonData);
          setStatus(success ? 'success' : 'error');
          setTimeout(() => setStatus('idle'), 3000);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setStatus('error');
          setTimeout(() => setStatus('idle'), 3000);
        }
      };
      reader.readAsText(file);
    },
    [importConfiguration]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });

  const handleClose = useCallback(() => {
    setStatus('idle');
    onClose();
  }, [setStatus, onClose]);

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
      <div className='bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
              <FileDown className='text-primary' size={22} />
            </div>
            <h2 className='text-xl font-bold'>Import / Export</h2>
          </div>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          {/* Export Section */}
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-gray-100 mb-2'>
              Export Configuration
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
              Download your current team configuration to save it for
              later use.
            </p>
            <button
              onClick={handleExport}
              disabled={teams.length === 0}
              className={clsx(
                'btn-primary w-full flex items-center justify-center gap-2',
                status === 'success' &&
                  teams.length > 0 &&
                  'bg-green-600 hover:bg-green-700'
              )}
            >
              {status === 'success' && teams.length > 0 ? (
                <>
                  <CheckCircle size={18} />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download size={18} />
                  Export Teams
                </>
              )}
            </button>
            {teams.length === 0 && (
              <p className='text-xs text-gray-500 mt-2 text-center'>
                Create teams first to enable export
              </p>
            )}
          </div>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300 dark:border-gray-700' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-3 bg-white dark:bg-gray-800 text-gray-500'>
                or
              </span>
            </div>
          </div>

          {/* Import Section with Dropzone */}
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-gray-100 mb-2'>
              Import Configuration
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
              Load a previously saved team configuration from a JSON
              file.
            </p>
            <div
              {...getRootProps()}
              className={clsx(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                isDragActive
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50',
                status === 'success' &&
                  'border-green-500 bg-green-50 dark:bg-green-900/20',
                status === 'error' &&
                  'border-red-500 bg-red-50 dark:bg-red-900/20'
              )}
            >
              <input {...getInputProps()} />
              <div className='flex flex-col items-center gap-3'>
                {status === 'success' ? (
                  <>
                    <CheckCircle
                      size={40}
                      className='text-green-500'
                    />
                    <p className='font-medium text-green-700 dark:text-green-300'>
                      Imported Successfully!
                    </p>
                    <p className='text-sm text-green-600 dark:text-green-400'>
                      Your configuration has been loaded
                    </p>
                  </>
                ) : status === 'error' ? (
                  <>
                    <XCircle size={40} className='text-red-500' />
                    <p className='font-medium text-red-700 dark:text-red-300'>
                      Import Failed
                    </p>
                    <p className='text-sm text-red-600 dark:text-red-400'>
                      Please check your file and try again
                    </p>
                  </>
                ) : (
                  <>
                    <FileText size={40} className='text-gray-400' />
                    <div>
                      <p className='font-medium text-gray-700 dark:text-gray-300'>
                        {isDragActive
                          ? 'Drop the file here'
                          : 'Drop file or click to browse'}
                      </p>
                      <p className='text-sm text-gray-500 mt-1'>
                        JSON files only
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className='flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700'>
            <button onClick={handleClose} className='btn-ghost px-6'>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
