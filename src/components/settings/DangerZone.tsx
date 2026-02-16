import DangerButton from '../ui/DangerButton';

interface Props {
    onClearStorage: () => void;
}

export default function DangerZone({ onClearStorage }: Props) {
    return (
        <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Danger Zone</h4>
                <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                    Clear all files and folders stored in the browser. This action cannot be undone.
                </p>
                <DangerButton
                    size="sm"
                    onClick={onClearStorage}
                    className="w-full"
                >
                    Clear In-Browser Storage
                </DangerButton>
            </div>
        </div>
    );
}
