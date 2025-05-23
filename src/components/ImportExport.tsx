import React, { useCallback } from 'react';
import {
  Download,
  FileDown,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import useStore from '../store/useStore';
import clsx from 'clsx';

const ImportExport: React.FC = () => {
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

  return (
    <div
      className='card animate-fade-in'
      style={{ animationDelay: '0.4s' }}
    >
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2.5 bg-gradient-to-br from-primary/20 to-rose-500/20 rounded-xl'>
          <FileDown className='text-primary' size={22} />
        </div>
        <h2 className='text-xl font-bold'>Import / Export</h2>
      </div>

      <div className='space-y-4'>
        {/* Export Section */}
        <div>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
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
        </div>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300 dark:border-gray-700' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-3 bg-white dark:bg-card-dark text-gray-500'>
              or
            </span>
          </div>
        </div>

        {/* Import Section with Dropzone */}
        <div>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
            Drop a file or click to load a saved configuration.
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
                  <CheckCircle size={40} className='text-green-500' />
                  <p className='font-medium text-green-700 dark:text-green-300'>
                    Imported Successfully!
                  </p>
                </>
              ) : status === 'error' ? (
                <>
                  <XCircle size={40} className='text-red-500' />
                  <p className='font-medium text-red-700 dark:text-red-300'>
                    Import Failed
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
      </div>
    </div>
  );
};

export default ImportExport;
