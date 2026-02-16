import { useEffect } from 'react';
import Button from './ui/Button';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    onAlternative?: () => void;
    alternativeText?: string;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    onAlternative,
    alternativeText,
}: Props) {
    if (!isOpen) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden border border-slate-200 dark:border-slate-700 transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 whitespace-pre-line">{message}</p>
                    <div className="flex items-center justify-end gap-3 flex-nowrap">
                        {onAlternative && (
                            <button
                                onClick={() => { onAlternative(); onClose(); }}
                                className="mr-auto text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                            >
                                {alternativeText}
                            </button>
                        )}
                        <Button variant="outline" onClick={onClose} size="sm">
                            {cancelText}
                        </Button>
                        <Button
                            variant={variant}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            size="sm"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
