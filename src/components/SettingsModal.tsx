import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useDataManagement } from '../hooks/useDataManagement';
import FolderPicker from './FolderPicker';
import PrimaryButton from './ui/PrimaryButton';
import OutlineButton from './ui/OutlineButton';
import ThemeToggle from './ui/ThemeToggle';
import ConfirmationModal from './ConfirmationModal';
import FileSystemSection from './settings/FileSystemSection';
import DataManagementSection from './settings/DataManagementSection';
import DangerZone from './settings/DangerZone';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
    const { rootPath, setRootPath, triggerRefresh } = useSettings();
    const [localPath, setLocalPath] = useState(rootPath);
    const [showPicker, setShowPicker] = useState(false);

    // Use custom hook for data management logic
    const {
        isExporting,
        isImporting,
        confirmImport,
        setConfirmImport,
        confirmClear,
        setConfirmClear,
        existingNoteCount,
        handleExport,
        handleImportClick,
        handleImportConfirm,
        handleClearStorage,
        handleSwitchToStorage,
        importError,
        setImportError
    } = useDataManagement();

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

    const handleOpenFolder = async () => {
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
                        <FileSystemSection
                            rootPath={rootPath}
                            supportsFileSystem={supportsFileSystem}
                            onOpenFolder={handleOpenFolder}
                            onSwitchToStorage={handleSwitchToStorage}
                        />

                        <hr className="border-slate-100 dark:border-slate-700" />

                        {/* Data Management */}
                        <DataManagementSection
                            isExporting={isExporting}
                            isImporting={isImporting}
                            onExport={handleExport}
                            onImport={handleImportClick}
                            rootPath={rootPath}
                        />

                        {rootPath === 'BROWSER_STORAGE' && (
                            <>
                                <hr className="border-slate-100 dark:border-slate-700" />
                                <DangerZone onClearStorage={() => setConfirmClear(true)} />
                            </>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                        <OutlineButton
                            onClick={onClose}
                        >
                            Cancel
                        </OutlineButton>
                        <PrimaryButton
                            onClick={handleSavePath}
                        >
                            Save Changes
                        </PrimaryButton>
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
                }}
                onConfirm={handleImportConfirm}
                title="Import & Overwrite Data"
                message={`This will overwrite all your existing in-browser data with the content from the selected JSON file.\n\nFound ${existingNoteCount} existing notes in In-Browser Storage.${rootPath !== 'BROWSER_STORAGE' ? '\n\nYou will be switched to In-Browser Storage mode.' : ''}\n\nThis action cannot be undone.`}
                confirmText={isImporting ? "Importing..." : "Import & Overwrite"}
                variant="danger"
                onAlternative={existingNoteCount > 0 ? handleSwitchToStorage : undefined}
                alternativeText="Load Existing Data"
            />
            <ConfirmationModal
                isOpen={!!importError}
                onClose={() => setImportError(null)}
                onConfirm={() => setImportError(null)}
                title="Import Failed"
                message={importError || ''}
                confirmText="Close"
                variant="danger"
                showCancel={false}
            />
        </>
    );
}
