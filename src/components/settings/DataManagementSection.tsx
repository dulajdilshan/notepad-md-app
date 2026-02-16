import SecondaryButton from '../ui/SecondaryButton';
import OutlineButton from '../ui/OutlineButton';

interface Props {
    isExporting: boolean;
    isImporting: boolean;
    onExport: () => void;
    onImport: () => void;
    rootPath: string;
}

export default function DataManagementSection({ isExporting, isImporting, onExport, onImport, rootPath }: Props) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white">Data Management</h4>
            <div className="grid grid-cols-1 gap-3">
                <SecondaryButton
                    onClick={onExport}
                    disabled={isExporting || isImporting}
                    className="w-full justify-center"
                    icon={isExporting ? <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                >
                    {isExporting ? 'Exporting...' : 'Export as JSON'}
                </SecondaryButton>

                <div className="space-y-2">
                    <OutlineButton
                        onClick={onImport}
                        disabled={isExporting || isImporting}
                        className="w-full justify-center border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                    >
                        Import from JSON
                    </OutlineButton>
                    {rootPath === 'BROWSER_STORAGE' && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
                            Note: Importing data will replace your current notes and automatically switch you to In-Browser Storage mode.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
