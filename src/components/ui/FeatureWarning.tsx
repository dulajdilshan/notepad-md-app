import React from 'react';

interface FeatureWarningProps {
    children: React.ReactNode;
}

export default function FeatureWarning({ children }: FeatureWarningProps) {
    return (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 p-3 rounded-md text-sm text-amber-800 dark:text-amber-200 mb-2">
            {children}
        </div>
    );
}
