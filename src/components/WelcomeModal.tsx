import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import FolderPicker from './FolderPicker';

export default function WelcomeModal() {
    const { rootPath, setRootPath } = useSettings();
    const [rootPathInput, setRootPathInput] = useState('');
    const [showPicker, setShowPicker] = useState(false);

    if (rootPath) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rootPathInput.trim()) {
            setRootPath(rootPathInput.trim());
            window.location.reload();
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-[32rem] max-w-full mx-4 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Welcome to NotePad.md</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        A modern, beautiful markdown editor for your local files.
                        To get started, please select a root directory to work in.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const { browserAdapter } = await import('../api/browserAdapter');
                                    await browserAdapter.openDirectory();
                                    const { setAdapter } = await import('../api/client');
                                    setAdapter('browser');
                                    // Set a dummy root path to bypass the modal check next time
                                    // Or better: The context should know about adapter type.
                                    // For now, we set a flag string. This triggers useFileTree refresh.
                                    setRootPath('BROWSER_NATIVE');
                                    // window.location.reload(); // Do not reload, as it clears permission
                                } catch (e) {
                                    console.error(e);
                                    alert('Failed to open folder. Please try again.');
                                }
                            }}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                            Open Local Folder (Browser Native)
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-300 dark:border-slate-600" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">Or connect to server</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={rootPathInput}
                                    onChange={(e) => setRootPathInput(e.target.value)}
                                    placeholder="/path/to/server/files"
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPicker(true)}
                                    className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
                                    title="Browse Server Files"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!rootPathInput.trim()}
                                className="w-full bg-slate-600 text-white py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                Connect to Server
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            {showPicker && (
                <FolderPicker
                    initialPath={rootPathInput}
                    onSelect={(selected) => {
                        setRootPathInput(selected);
                        setShowPicker(false);
                    }}
                    onCancel={() => setShowPicker(false)}
                />
            )}
        </>
    );
}
