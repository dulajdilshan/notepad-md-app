import { useState, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import MainPanel from './components/layout/MainPanel';
import TodoPanel from './components/todos/TodoPanel';
import CreateItemModal from './components/modals/CreateItemModal';
import SettingsModal from './components/modals/SettingsModal';
import WelcomeModal from './components/modals/WelcomeModal';
import RestoreSessionModal from './components/modals/RestoreSessionModal';
import ConfirmationModal from './components/modals/ConfirmationModal';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { useFileTree } from './hooks/useFileTree';
import { useFileContent } from './hooks/useFileContent';
import { useTodos } from './hooks/useTodos';
import { createFile, createFolder, deleteFile, deleteFolder } from './api/client';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { ViewMode, CreateItemModal as CreateItemModalType, ConfirmationState } from './types';

function AppContent() {
  const { tree, loading, refresh, permissionNeeded, restoreSession } = useFileTree();
  const { setRootPath } = useSettings();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [modal, setModal] = useState<CreateItemModalType | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileTodoOpen, setIsMobileTodoOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const { content, setContent, loading: fileLoading, isDirty, save, saving } = useFileContent(selectedPath);
  const { todos, toggleTodo } = useTodos(content, setContent);

  const handleSelectFile = useCallback((path: string) => {
    setSelectedPath(path);
    setViewMode('edit');
    setIsMobileSidebarOpen(false); // Close sidebar on file select (mobile)
  }, []);

  const handleToggleMode = useCallback(() => {
    setViewMode((m) => (m === 'edit' ? 'preview' : 'edit'));
  }, []);

  // Determine base path for new items (folder of selected file, or root)
  const getBasePath = () => {
    if (!selectedPath) return '';
    const parts = selectedPath.split('/');
    // If the selected item is a file, use its parent folder
    if (selectedPath.endsWith('.md')) {
      parts.pop();
    }
    return parts.join('/');
  };

  const handleCreate = async (name: string) => {
    if (!modal) return;
    const base = modal.basePath || getBasePath();
    const fullPath = base ? `${base}/${name}` : name;

    try {
      if (modal.type === 'file') {
        await createFile(fullPath);
      } else {
        await createFolder(fullPath);
      }
      await refresh();
      setModal(null);
    } catch (err) {
      console.error('Failed to create:', err);
    }
  };

  const handleCloseFile = useCallback(() => {
    setSelectedPath(null);
  }, []);

  // Global ESC handler refactored to hook
  useKeyboardShortcuts({
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
  });

  const performDelete = async (path: string, type: 'file' | 'folder') => {
    try {
      if (type === 'file') {
        await deleteFile(path);
      } else {
        await deleteFolder(path);
      }
      if (selectedPath === path || (selectedPath && selectedPath.startsWith(path + '/'))) {
        setSelectedPath(null);
      }
      await refresh();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleDelete = (path: string, type: 'file' | 'folder') => {
    setConfirmation({
      isOpen: true,
      title: `Delete ${type === 'file' ? 'File' : 'Folder'}`,
      message: `Are you sure you want to delete "${path.split('/').pop()}"? This action cannot be undone.`,
      onConfirm: () => performDelete(path, type),
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-200 overflow-hidden relative">
      <WelcomeModal />
      {permissionNeeded && (
        <RestoreSessionModal
          onRestore={restoreSession}
          onCancel={() => {
            setRootPath('');
            window.location.reload();
          }}
        />
      )}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: block, Mobile: fixed off-canvas */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 will-change-transform
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          tree={tree}
          loading={loading}
          selectedPath={selectedPath}
          onSelectFile={handleSelectFile}
          onCreateFile={(path) => setModal({ type: 'file', basePath: path })}
          onCreateFolder={(path) => setModal({ type: 'folder', basePath: path })}
          onDelete={handleDelete}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      <MainPanel
        filePath={selectedPath}
        content={content}
        viewMode={viewMode}
        isDirty={isDirty}
        isSaving={saving}
        loading={fileLoading}
        onContentChange={setContent}
        onToggleMode={handleToggleMode}
        onSave={save}
        onClose={handleCloseFile}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        onToggleMobileTodo={() => setIsMobileTodoOpen(prev => !prev)}
      />

      {/* Mobile Todo Backdrop */}
      {isMobileTodoOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileTodoOpen(false)}
        />
      )}

      {/* TodoPanel - Desktop: block, Mobile: fixed off-canvas */}
      <div className={`
        fixed inset-y-0 right-0 z-40 w-80 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 will-change-transform
        ${isMobileTodoOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <TodoPanel
          todos={todos}
          onToggle={toggleTodo}
          hasFile={!!selectedPath}
          onClose={() => setIsMobileTodoOpen(false)}
        />
      </div>

      {modal && (
        <CreateItemModal
          type={modal.type}
          basePath={modal.basePath || getBasePath()}
          onConfirm={handleCreate}
          onCancel={() => setModal(null)}
        />
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
