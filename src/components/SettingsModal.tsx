import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import FolderPicker from './FolderPicker';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
    const { theme, toggleTheme, rootPath, setRootPath, triggerRefresh } = useSettings();
    const [localPath, setLocalPath] = useState(rootPath);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        if (isOpen) setLocalPath(rootPath);

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, rootPath]);

    if (!isOpen) return null;

    const handleSavePath = () => {
        if (localPath !== rootPath) {
            setRootPath(localPath);
            // Reload to apply changes because App's file tree needs to refetch
            window.location.reload();
        }
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
                <div
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden border border-slate-200 dark:border-slate-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Settings</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="p-6 space-y-6 bg-white dark:bg-slate-800">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white">Appearance</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred theme</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-200'
                                    }`}
                            >
                                <span className="sr-only">Toggle theme</span>
                                <span className="absolute left-1.5 text-yellow-500 z-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </span>
                                <span className="absolute right-1.5 text-slate-400 z-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                </span>
                                <span
                                    className={`${theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                                        } inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm z-10`}
                                />
                            </button>
                        </div>

                        <hr className="border-slate-100 dark:border-slate-700" />

                        {/* Root Path Config */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">Root Directory</h4>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={localPath}
                                    onChange={(e) => setLocalPath(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                />
                                <button
                                    onClick={() => setShowPicker(true)}
                                    className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
                                    title="Browse Folder"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Use absolute path for server mode.
                            </p>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">Or use browser native</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const { browserAdapter } = await import('../api/browserAdapter');
                                        await browserAdapter.openDirectory();
                                        const { setAdapter } = await import('../api/client');
                                        setAdapter('browser');
                                        setRootPath('BROWSER_NATIVE');
                                        triggerRefresh(); // Force tree refresh even if rootPath was already BROWSER_NATIVE
                                        onClose();
                                    } catch (e) {
                                        console.error(e);
                                        alert('Failed to open folder. Please try again.');
                                    }
                                }}
                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                                Open Local Folder
                            </button>
                        </div>

                        {rootPath === 'BROWSER_STORAGE' && (
                            <>
                                <hr className="border-slate-100 dark:border-slate-700" />
                                <div className="space-y-4">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                                        <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Danger Zone</h4>
                                        <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                                            Clear all files and folders stored in the browser. This action cannot be undone.
                                        </p>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Are you sure you want to delete all files stored in this browser? This cannot be undone.')) {
                                                    try {
                                                        const { clearStorage } = await import('../api/localStorageAdapter');
                                                        await clearStorage();
                                                        window.location.reload();
                                                    } catch (e) {
                                                        console.error('Failed to clear storage:', e);
                                                        alert('Failed to clear storage.');
                                                    }
                                                }
                                            }}
                                            className="w-full py-2 px-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors text-sm font-medium"
                                        >
                                            Clear In-Browser Storage
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSavePath}
                            className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md shadow-sm transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
            {showPicker && (
                <FolderPicker
                    initialPath={localPath}
                    onSelect={(path) => {
                        setLocalPath(path);
                        setShowPicker(false);
                    }}
                    onCancel={() => setShowPicker(false)}
                />
            )}
        </>
    );
}
