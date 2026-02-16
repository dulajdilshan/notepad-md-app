import { useState, useEffect } from 'react';
import { fetchDirectories } from '../api/client';

interface Props {
    onSelect: (path: string) => void;
    onCancel: () => void;
    initialPath?: string;
}

export default function FolderPicker({ onSelect, onCancel, initialPath }: Props) {
    const [currentPath, setCurrentPath] = useState(initialPath || '');
    const [directories, setDirectories] = useState<string[]>([]);
    const [parentPath, setParentPath] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPath = async (path?: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDirectories(path);
            setCurrentPath(data.current);
            setParentPath(data.parent);
            setDirectories(data.directories);
        } catch (err) {
            console.error(err);
            setError('Failed to load directory listing');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPath(initialPath);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleNavigate = (dirName: string) => {
        // We assume standard path separators. Backend returns current path without trailing slash usually.
        // If we are on windows backend but client is whatever, backend should handle path resolution if we send full path.
        // BUT we are constructing path on client here blindly? 
        // Actually backend returns 'current' which is absolute path.
        // We can just send 'current/dirname' ?? 
        // Wait, path separators are tricky.
        // Ideally we pass the full path of the subdirectory.
        // But we don't know the separator if we don't ask backend.
        // Simpler: We know `currentPath`. On Unix `/`. On Win `\`.
        // Let's try to detect or just send `currentPath` + separator + `dirName`.
        // Or, we can just send `currentPath` and `dirName` to an endpoint? No.
        // Let's try forward slash. Node path module often handles mixed separators gracefully.

        // Better: check if currentPath ends with separator.
        const separator = currentPath.includes('\\') ? '\\' : '/';
        const nextPath = currentPath.endsWith(separator)
            ? `${currentPath}${dirName}`
            : `${currentPath}${separator}${dirName}`;
        loadPath(nextPath);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-[32rem] max-w-full flex flex-col max-h-[80vh] border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 rounded-t-lg">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Select Folder</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex gap-2 items-center overflow-x-auto">
                    <button
                        onClick={() => parentPath && loadPath(parentPath)}
                        disabled={!parentPath}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30 transition-colors"
                        title="Up one level"
                    >
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    </button>
                    <div className="text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {currentPath}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar min-h-[300px] bg-white dark:bg-slate-800">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 p-4">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-1">
                            {directories.map(dir => (
                                <button
                                    key={dir}
                                    onClick={() => handleNavigate(dir)}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700/50 rounded text-left group transition-colors"
                                >
                                    <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                                    <span className="text-sm text-slate-700 dark:text-slate-200 truncate flex-1">{dir}</span>
                                    <span className="opacity-0 group-hover:opacity-100 text-xs text-blue-500 dark:text-blue-400 font-medium">Open</span>
                                </button>
                            ))}
                            {directories.length === 0 && (
                                <div className="text-center text-slate-400 dark:text-slate-500 py-8">No subdirectories found</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2 bg-white dark:bg-slate-800 rounded-b-lg">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSelect(currentPath)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm transition-colors"
                    >
                        Select This Folder
                    </button>
                </div>
            </div>
        </div>
    );
}
