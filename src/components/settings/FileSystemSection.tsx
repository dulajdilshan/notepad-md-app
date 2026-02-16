import Button from '../ui/Button';

interface Props {
    rootPath: string;
    supportsFileSystem: boolean;
    onOpenFolder: () => void;
    onSwitchToStorage: () => void;
}

export default function FileSystemSection({ rootPath, supportsFileSystem, onOpenFolder, onSwitchToStorage }: Props) {
    return (
        <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white">File System Access</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Switch between Browser Native (Chrome/Edge) or In-Browser Storage (Safari/Firefox).
            </p>

            <Button
                disabled={!supportsFileSystem}
                onClick={onOpenFolder}
                variant={supportsFileSystem ? 'primary' : 'outline'}
                className={!supportsFileSystem ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 w-full' : 'w-full'}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>}
            >
                Open Local Folder {supportsFileSystem ? '' : '(Not Supported)'}
            </Button>

            {rootPath !== 'BROWSER_STORAGE' && (
                <>
                    <div className="relative py-2">
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">Or</span>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={onSwitchToStorage}
                        className="w-full"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    >
                        Use In-Browser Storage
                    </Button>
                </>
            )}
        </div>
    );
}
