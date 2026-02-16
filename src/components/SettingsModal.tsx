import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import FolderPicker from './FolderPicker';
import Button from './ui/Button';
import ThemeToggle from './ui/ThemeToggle';
import ConfirmationModal from './ConfirmationModal';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
    const { rootPath, setRootPath, triggerRefresh } = useSettings();
    const [localPath, setLocalPath] = useState(rootPath);
    const [showPicker, setShowPicker] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importData, setImportData] = useState<any>(null);
    const [confirmImport, setConfirmImport] = useState(false);
    const [existingNoteCount, setExistingNoteCount] = useState(0);

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

    const handleClearStorage = async () => {
        try {
            const { clearStorage } = await import('../api/localStorageAdapter');
            await clearStorage();
            window.location.reload();
        } catch (e) {
            console.error('Failed to clear storage:', e);
            alert('Failed to clear storage.');
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const { exportData } = await import('../api/client');
            const data = await exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `notepad-md-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Export failed:', e);
            alert('Failed to export data.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const json = JSON.parse(text);

                // Check for existing notes
                const { localStorageAdapter } = await import('../api/localStorageAdapter');
                const count = await localStorageAdapter.getNoteCount();
                setExistingNoteCount(count);

                setImportData(json);
                setConfirmImport(true);
            } catch (err) {
                console.error('Failed to parse JSON', err);
                alert('Invalid JSON file');
            }
        };
        input.click();
    };

    const handleImportConfirm = async () => {
        if (!importData) return;
        setIsImporting(true);
        try {
            const { localStorageAdapter } = await import('../api/localStorageAdapter');
            const { setAdapter } = await import('../api/client');

            await localStorageAdapter.importData(importData);

            // Switch to local storage mode
            setAdapter('local-storage');
            setRootPath('BROWSER_STORAGE');

            window.location.reload();
        } catch (e) {
            console.error('Import failed:', e);
            alert('Failed to import data.');
            setIsImporting(false);
            setConfirmImport(false);
        }
    };

    const handleSwitchToStorage = async () => {
        try {
            const { setAdapter } = await import('../api/client');
            setAdapter('local-storage');
            setRootPath('BROWSER_STORAGE');
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Failed to switch to in-browser storage.');
        }
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

                    <div className="p-6 space-y-6 bg-white dark:bg-slate-800 overflow-y-auto max-h-[60vh]">
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
                                        triggerRefresh();
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

                        <hr className="border-slate-100 dark:border-slate-700" />

                        {/* Data Management */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">Data Management</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={handleExport}
                                    disabled={isExporting || isImporting}
                                    className="w-full justify-center"
                                    icon={isExporting ? <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                                >
                                    {isExporting ? 'Exporting...' : 'Export as JSON'}
                                </Button>

                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleImportClick}
                                        disabled={isExporting || isImporting}
                                        className="w-full justify-center border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                                    >
                                        Import from JSON
                                    </Button>
                                    {rootPath === 'BROWSER_STORAGE' && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
                                            Note: Importing data will replace your current notes and automatically switch you to In-Browser Storage mode.
                                        </p>
                                    )}
                                </div>
                            </div>
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
                                            onClick={() => setConfirmClear(true)}
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
            <ConfirmationModal
                isOpen={confirmClear}
                onClose={() => setConfirmClear(false)}
                onConfirm={handleClearStorage}
                title="Clear Browser Storage"
                message="Are you sure you want to delete all files stored in this browser? This action cannot be undone."
                confirmText="Clear Storage"
                variant="danger"
            />
            <ConfirmationModal
                isOpen={confirmImport}
                onClose={() => {
                    setConfirmImport(false);
                    setImportData(null);
                }}
                onConfirm={handleImportConfirm}
                title="Import & Overwrite Data"
                message={`This will overwrite all your existing in-browser data with the content from the selected JSON file.\n\nFound ${existingNoteCount} existing notes in In-Browser Storage.${rootPath !== 'BROWSER_STORAGE' ? '\n\nYou will be switched to In-Browser Storage mode.' : ''}\n\nThis action cannot be undone.`}
                confirmText={isImporting ? "Importing..." : "Import & Overwrite"}
                variant="danger"
                onAlternative={existingNoteCount > 0 ? handleSwitchToStorage : undefined}
                alternativeText="Load Existing Data"
            />
        </>
    );
}
