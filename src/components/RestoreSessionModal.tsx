
interface Props {
    onRestore: () => void;
    onCancel: () => void;
}

export default function RestoreSessionModal({ onRestore, onCancel }: Props) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-96 max-w-full mx-4 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Resume Session?</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
                    We found a previously opened folder. For security reasons, the browser requires your permission to access it again.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onRestore}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                        Restore Access
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors text-sm"
                    >
                        Choose Different Folder
                    </button>
                </div>
            </div>
        </div>
    );
}
