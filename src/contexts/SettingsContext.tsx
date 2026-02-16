import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { LOCAL_STORAGE_KEYS } from '../constants';

interface SettingsContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    rootPath: string;
    setRootPath: (path: string) => void;
    refreshKey: number;
    triggerRefresh: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
    });

    const [rootPath, setRootPathState] = useState<string>(() => {
        return localStorage.getItem(LOCAL_STORAGE_KEYS.ROOT_PATH) || '';
    });

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    const setRootPath = (path: string) => {
        setRootPathState(path);
        if (path) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.ROOT_PATH, path);
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.ROOT_PATH);
        }
    };

    const triggerRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <SettingsContext.Provider value={{ theme, toggleTheme, rootPath, setRootPath, refreshKey, triggerRefresh }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
