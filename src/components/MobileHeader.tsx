
interface Props {
    onToggleSidebar: () => void;
    onToggleTodo: () => void;
    title?: string;
    className?: string;
}

export default function MobileHeader({ onToggleSidebar, onToggleTodo, title = 'NotePad.md', className = '' }: Props) {
    return (
        <div className={`md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 ${className}`}>
            <button
                onClick={onToggleSidebar}
                className="p-2 -ml-2 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</span>
            <button
                onClick={onToggleTodo}
                className="p-2 -mr-2 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </button>
        </div>
    );
}
