import MobileHeader from './MobileHeader';
import EditorToolbar from './EditorToolbar';
import MarkdownEditor from '../editor/MarkdownEditor';
import MarkdownViewer from '../editor/MarkdownViewer';

interface Props {
  filePath: string | null;
  content: string;
  viewMode: 'edit' | 'preview';
  isDirty: boolean;
  isSaving: boolean;
  loading: boolean;
  onContentChange: (value: string) => void;
  onToggleMode: () => void;
  onSave: () => void;
  onClose: () => void;
  onToggleMobileSidebar: () => void;
  onToggleMobileTodo: () => void;
}

export default function MainPanel({
  filePath,
  content,
  viewMode,
  isDirty,
  isSaving,
  loading,
  onContentChange,
  onToggleMode,
  onSave,
  onClose,
  onToggleMobileSidebar,
  onToggleMobileTodo,
}: Props) {
  if (!filePath) {
    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
        {/* Mobile Header for Empty State */}
        <MobileHeader onToggleSidebar={onToggleMobileSidebar} onToggleTodo={onToggleMobileTodo} />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 dark:text-slate-600 text-sm">Select a file to start editing</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
        {/* Mobile Header for Loading State */}
        <MobileHeader onToggleSidebar={onToggleMobileSidebar} onToggleTodo={onToggleMobileTodo} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 dark:text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const fileName = filePath.split('/').pop() || filePath;

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0 shadow-sm z-10 transition-colors">
      <EditorToolbar
        fileName={fileName}
        viewMode={viewMode}
        isDirty={isDirty}
        isSaving={isSaving}
        onToggleMode={onToggleMode}
        onSave={onSave}
        onClose={onClose}
        onToggleMobileSidebar={onToggleMobileSidebar}
        onToggleMobileTodo={onToggleMobileTodo}
      />
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'edit' ? (
          <MarkdownEditor content={content} onChange={onContentChange} />
        ) : (
          <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 px-2 transition-colors">
            <MarkdownViewer content={content} />
          </div>
        )}
      </div>
    </div>
  );
}
