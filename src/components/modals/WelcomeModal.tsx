import { useSettings } from '../../contexts/SettingsContext';
import PrimaryButton from '../ui/PrimaryButton';
import OutlineButton from '../ui/OutlineButton';
import SecondaryButton from '../ui/SecondaryButton';
import appLogo from '../../assets/notepad.md-logo.png';
import FeatureWarning from '../ui/FeatureWarning';
import { ADAPTER_TYPE } from '../../constants';

export default function WelcomeModal() {
    const { rootPath, setRootPath } = useSettings();

    // Feature detection
    const supportsFileSystem = 'showDirectoryPicker' in window;

    if (rootPath) return null;

    const handleLocalStorage = async () => {
        try {
            const { setAdapter } = await import('../../api/client');
            setAdapter('local-storage');
            setRootPath(ADAPTER_TYPE.STORAGE);
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Failed to initialize local storage mode.');
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-[32rem] max-w-full mx-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-center mb-6">
                        <img src={appLogo} alt="NotePad.md" className="h-28 w-auto" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 text-center">Welcome to NotePad.md</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-center">
                        A modern, beautiful markdown editor.
                    </p>

                    <div className="flex flex-col gap-3">
                        {!supportsFileSystem && (
                            <FeatureWarning>
                                <strong>Browser Notice:</strong> Your browser (Safari/Firefox) does not support direct file access. Please use the <b>In-Browser Storage</b> mode below.
                            </FeatureWarning>
                        )}

                        {supportsFileSystem ? (
                            <PrimaryButton
                                onClick={async () => {
                                    try {
                                        const { browserAdapter } = await import('../../api/browserAdapter');
                                        await browserAdapter.openDirectory();
                                        const { setAdapter } = await import('../../api/client');
                                        setAdapter('browser');
                                        setRootPath(ADAPTER_TYPE.BROWSER);
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                                className="w-full justify-center"
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>}
                            >
                                Open Local Folder (Browser Native)
                            </PrimaryButton>
                        ) : (
                            <OutlineButton
                                disabled
                                className="bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 w-full justify-center"
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>}
                            >
                                Open Local Folder (Not Supported)
                            </OutlineButton>
                        )}

                        <SecondaryButton
                            onClick={handleLocalStorage}
                            className="w-full justify-center"
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                        >
                            Use In-Browser Storage (Demo)
                        </SecondaryButton>

                    </div>
                </div>
            </div>
        </>
    );
}
