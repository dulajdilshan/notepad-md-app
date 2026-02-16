import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { version } from '../../package.json';

export function useDataManagement() {
    const { rootPath, setRootPath } = useSettings();
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importData, setImportData] = useState<any>(null);
    const [importVersion, setImportVersion] = useState<string | undefined>(undefined);
    const [confirmImport, setConfirmImport] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);
    const [existingNoteCount, setExistingNoteCount] = useState(0);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const { exportData } = await import('../api/client');
            const data = await exportData();

            // Get currently stored version if available, or fallback to package version
            const { localStorageAdapter } = await import('../api/localStorageAdapter');
            const storedVersion = await localStorageAdapter.getVersion();

            const exportObj = {
                "notepad.md-version": storedVersion || version,
                content: data
            };

            const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
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

                let contentToImport = json;
                let versionToImport = undefined;

                if (json['notepad.md-version']) {
                    contentToImport = json.content;
                    versionToImport = json['notepad.md-version'];
                }

                const { localStorageAdapter } = await import('../api/localStorageAdapter');
                const count = await localStorageAdapter.getNoteCount();
                setExistingNoteCount(count);

                setImportData(contentToImport);
                setImportVersion(versionToImport);
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

            await localStorageAdapter.importData(importData, importVersion);

            // Also ensure we set the current version if it wasn't in the file
            if (!importVersion) {
                await localStorageAdapter.setVersion(version);
            }

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

    return {
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
        rootPath
    };
}
