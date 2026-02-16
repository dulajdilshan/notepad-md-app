
import { useEffect } from 'react';

interface Params {
    modal: any;
    isSettingsOpen: boolean;
    isMobileSidebarOpen: boolean;
    isMobileTodoOpen: boolean;
    selectedPath: string | null;
    setModal: (val: any) => void;
    setIsSettingsOpen: (val: boolean) => void;
    setIsMobileSidebarOpen: (val: boolean) => void;
    setIsMobileTodoOpen: (val: boolean) => void;
    handleCloseFile: () => void;
}

export function useKeyboardShortcuts({
    modal,
    isSettingsOpen,
    isMobileSidebarOpen,
    isMobileTodoOpen,
    selectedPath,
    setModal,
    setIsSettingsOpen,
    setIsMobileSidebarOpen,
    setIsMobileTodoOpen,
    handleCloseFile,
}: Params) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Global Escape handler
            if (e.key === 'Escape') {
                if (modal) {
                    setModal(null);
                    return;
                }
                if (isSettingsOpen) {
                    setIsSettingsOpen(false);
                    return;
                }
                if (isMobileSidebarOpen) {
                    setIsMobileSidebarOpen(false);
                    return;
                }
                if (isMobileTodoOpen) {
                    setIsMobileTodoOpen(false);
                    return;
                }
                if (selectedPath) {
                    handleCloseFile();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        modal,
        isSettingsOpen,
        isMobileSidebarOpen,
        isMobileTodoOpen,
        selectedPath,
        setModal,
        setIsSettingsOpen,
        setIsMobileSidebarOpen,
        setIsMobileTodoOpen,
        handleCloseFile,
    ]);
}
