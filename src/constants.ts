export const ADAPTER_TYPE = { BROWSER: 'BROWSER_NATIVE', STORAGE: 'BROWSER_STORAGE' } as const;

export const STORAGE_KEYS = {
    ROOT: 'vfs:root',
    CONTENT_PREFIX: 'vfs:content:',
    VERSION: 'vfs:version',
} as const;

export const LOCAL_STORAGE_KEYS = {
    ROOT_PATH: 'rootPath',
    THEME: 'theme',
    ADAPTER_TYPE: 'adapterType',
} as const;

export const AUTO_SAVE_DELAY = 1500;

export const SAVE_INDICATOR_DELAY = 500;
