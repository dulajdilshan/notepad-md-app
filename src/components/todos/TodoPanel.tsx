import type { TodoItem } from '../../types';
import TodoList from './TodoList';

interface Props {
  todos: TodoItem[];
  onToggle: (lineIndex: number) => void;
  hasFile: boolean;
  onClose: () => void;
}

export default function TodoPanel({ todos, onToggle, hasFile, onClose }: Props) {
  const completed = todos.filter((t) => t.checked).length;
  const total = todos.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-80 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-l border-slate-200/60 dark:border-slate-800/60 flex flex-col h-full backdrop-blur-xl shadow-[-4px_0_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300">
      <div className="px-5 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 flex justify-between items-center backdrop-blur-xl supports-[backdrop-filter]:bg-white/40">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-400">Tasks</h2>
        <button
          onClick={onClose}
          className="md:hidden text-slate-400 hover:text-slate-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="px-5 pb-3 bg-white/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        {hasFile && total > 0 ? (
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              <span>{completed}/{total} completed</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="h-8 flex items-center">
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">No tasks detected</span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {hasFile ? (
          <TodoList todos={todos} onToggle={onToggle} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 opacity-60">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-sm">Select a file</p>
          </div>
        )}
      </div>
    </div>
  );
}
