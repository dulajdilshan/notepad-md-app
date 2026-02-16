import { useState, useEffect } from 'react';

interface Props {
  type: 'file' | 'folder';
  basePath: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function CreateItemModal({ type, basePath, onConfirm, onCancel }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const validate = (val: string) => {
    if (!val) return 'Name cannot be empty';
    if (!/^[a-zA-Z0-9-._\s]+$/.test(val)) return 'Only letters, numbers, spaces, dots, and underscores allowed';
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    onConfirm(trimmed);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-96 border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
          New {type === 'file' ? 'File' : 'Folder'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {basePath ? `Inside: ${basePath}/` : 'In root directory'}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder={type === 'file' ? 'filename.md' : 'folder-name'}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white transition-colors ${error ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                }`}
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm px-4 py-2 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
