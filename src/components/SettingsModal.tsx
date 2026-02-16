import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import FolderPicker from './FolderPicker';
import Button from './ui/Button';
import ThemeToggle from './ui/ThemeToggle';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
    const { rootPath, setRootPath, triggerRefresh } = useSettings();
    const [localPath, setLocalPath] = useState(rootPath);
    const [showPicker, setShowPicker] = useState(false);

    // Feature detection
    const supportsFileSystem = 'showDirectoryPicker' in window;

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
                        <ThemeToggle />

                        <hr className="border-slate-100 dark:border-slate-700" />

                        {/* Root Path Config */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">File System Access</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                Switch between Browser Native (Chrome/Edge) or In-Browser Storage (Safari/Firefox).
                            </p>

                            <Button
                                disabled={!supportsFileSystem}
                                onClick={async () => {
                                    if (!supportsFileSystem) return;
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
                                variant={supportsFileSystem ? 'primary' : 'outline'}
                                className={!supportsFileSystem ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 w-full' : 'w-full'}
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>}
                            >
                                Open Local Folder {supportsFileSystem ? '' : '(Not Supported)'}
                            </Button>

                            {rootPath !== 'BROWSER_STORAGE' && (
                                <>
                                    <div className="relative py-2">
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">Or</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="secondary"
                                        onClick={async () => {
                                            try {
                                                const { setAdapter } = await import('../api/client');
                                                setAdapter('local-storage');
                                                setRootPath('BROWSER_STORAGE');
                                                window.location.reload();
                                            } catch (e) {
                                                console.error(e);
                                                alert('Failed to switch to in-browser storage.');
                                            }
                                        }}
                                        className="w-full"
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                                    >
                                        Use In-Browser Storage
                                    </Button>
                                </>
                            )}
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
                                        <Button
                                            variant="danger"
                                            size="sm"
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
                                            className="w-full"
                                        >
                                            Clear In-Browser Storage
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSavePath}
                        >
                            Save Changes
                        </Button>
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
