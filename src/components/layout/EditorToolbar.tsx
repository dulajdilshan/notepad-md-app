interface Props {
  fileName: string;
  viewMode: 'edit' | 'preview';
  isDirty: boolean;
  isSaving: boolean;
  onToggleMode: () => void;
  onSave: () => void;
  onClose: () => void;
  onToggleMobileSidebar: () => void;
  onToggleMobileTodo: () => void;
}

export default function EditorToolbar({ fileName, viewMode, isDirty, isSaving, onToggleMode, onSave, onClose, onToggleMobileSidebar, onToggleMobileTodo }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm z-20 transition-colors">
      <div className="flex items-center gap-2">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 -ml-2 mr-2 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px] sm:max-w-none">{fileName}</span>
        {isDirty && !isSaving && (
          <span className="flex h-2 w-2 relative" title="Unsaved changes">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMode}
          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-200 hidden sm:block ${viewMode === 'edit'
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
            }`}
        >
          {viewMode === 'edit' ? 'Preview' : 'Edit'}
        </button>
        {/* Mobile View Toggle Icon only */}
        <button
          onClick={onToggleMode}
          className={`p-1.5 rounded-md transition-all duration-200 sm:hidden ${viewMode === 'edit'
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            : 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
            }`}
        >
          {viewMode === 'edit' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          )}
        </button>

        <button
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className={`text-xs font-medium px-4 py-1.5 rounded-md transition-all duration-200 flex items-center gap-2 ${isDirty || isSaving
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed hidden sm:flex'
            }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">Saving...</span>
            </>
          ) : (
            'Save'
          )}
        </button>
        {/* Mobile Save Icon if dirty */}
        {(isDirty || isSaving) && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="sm:hidden p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          </button>
        )}

        {/* Mobile Todo Toggle */}
        <button
          onClick={onToggleMobileTodo}
          className="md:hidden p-2 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <button
          onClick={onClose}
          className="text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-md transition-colors"
          title="Close file"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
}
