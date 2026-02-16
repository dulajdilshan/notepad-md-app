/// <reference types="vite/client" />
/// <reference types="@types/wicg-file-system-access" />
import type { FileSystemAdapter } from './interfaces';
import type { TreeNode } from '../types';
import { get, set } from 'idb-keyval';

let rootHandle: FileSystemDirectoryHandle | null = null;

// Helper to get handle from internal path
async function getHandleFromPath(path: string, create = false, isDirectory = false): Promise<FileSystemHandle | null> {
    if (!rootHandle) throw new Error('Root handle not set');

    // Internal path should be relative to root, e.g., "folder/file.md"
    // If path starts with /, strip it.
    const relativePath = path.startsWith('/') ? path.slice(1) : path;

    if (!relativePath) return rootHandle;

    const parts = relativePath.split('/');
    let currentDir: FileSystemDirectoryHandle = rootHandle;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;

        try {
            if (isLast && !isDirectory) {
                return await currentDir.getFileHandle(part, { create });
            } else {
                currentDir = await currentDir.getDirectoryHandle(part, { create: create || (isLast && isDirectory) });
            }
        } catch (e) {
            if (!create) return null;
            throw e;
        }
    }
    return currentDir;
}

// Recursive function to build tree
async function buildTree(handle: FileSystemDirectoryHandle, path: string = ''): Promise<TreeNode[]> {
    const nodes: TreeNode[] = [];

    for await (const entry of handle.values()) {
        // Skip hidden files/folders if needed
        if (entry.name.startsWith('.')) continue;

        const currentPath = path ? `${path}/${entry.name}` : entry.name;

        if (entry.kind === 'file') {
            if (entry.name.endsWith('.md')) { // Check for supported extensions
                nodes.push({
                    name: entry.name,
                    path: currentPath,
                    type: 'file'
                });
            }
        } else if (entry.kind === 'directory') {
            const children = await buildTree(entry as FileSystemDirectoryHandle, currentPath);
            nodes.push({
                name: entry.name,
                path: currentPath,
                type: 'folder',
                children
            });
        }
    }

    // Sort: folders first, then files
    return nodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
    });
}

export const browserAdapter = {
    // Initialization method specific to browser adapter
    async initialize(): Promise<void> {
        try {
            const handle = await get<FileSystemDirectoryHandle>('rootHandle');
            if (handle) {
                // Verify permissions
                if ((await handle.queryPermission({ mode: 'readwrite' })) === 'granted') {
                    rootHandle = handle;
                    return;
                }
            }
        } catch (e) {
            console.error('Failed to restore handle', e);
        }
    },

    async checkSession(): Promise<'ready' | 'needs-permission' | 'none'> {
        try {
            const handle = await get<FileSystemDirectoryHandle>('rootHandle');
            if (!handle) return 'none';

            const perm = await handle.queryPermission({ mode: 'readwrite' });
            if (perm === 'granted') {
                rootHandle = handle;
                return 'ready';
            }
            return 'needs-permission';
        } catch (error) {
            console.error('Error checking session:', error);
            return 'none';
        }
    },

    async restoreSession(): Promise<boolean> {
        try {
            const handle = await get<FileSystemDirectoryHandle>('rootHandle');
            if (!handle) return false;

            const perm = await handle.requestPermission({ mode: 'readwrite' });
            if (perm === 'granted') {
                rootHandle = handle;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error restoring session:', error);
            return false;
        }
    },

    async openDirectory(): Promise<void> {
        rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        await set('rootHandle', rootHandle);
    },

    async fetchTree(): Promise<TreeNode[]> {
        if (!rootHandle) throw new Error('No folder selected');
        return await buildTree(rootHandle);
    },

    async fetchDirectories(_path?: string): Promise<{ current: string; parent: string | null; directories: string[] }> {
        // This method is for the "Picker", but in Browser Native mode we use native picker.
        // However, the FolderPicker component might still call this if we reuse it.
        // Ideally, we don't use FolderPicker in Browser Mode.
        // We return empty mock to satisfy interface if called.
        return { current: '', parent: null, directories: [] };
    },

    async readFile(path: string): Promise<string> {
        const handle = await getHandleFromPath(path) as FileSystemFileHandle;
        if (!handle) throw new Error('File not found');
        const file = await handle.getFile();
        return await file.text();
    },

    async saveFile(path: string, content: string): Promise<void> {
        const handle = await getHandleFromPath(path, true) as FileSystemFileHandle;
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
    },

    async createFile(path: string): Promise<void> {
        // Check if extension in path, else add .md
        const fullPath = path.endsWith('.md') ? path : `${path}.md`;
        const handle = await getHandleFromPath(fullPath, true);
        // If created, write initial content?
        if (handle) {
            const fileHandle = handle as FileSystemFileHandle;
            const writable = await fileHandle.createWritable();
            const name = fullPath.split('/').pop()?.replace('.md', '') || 'New File';
            await writable.write(`# ${name}\n`);
            await writable.close();
        }
    },

    async createFolder(path: string): Promise<void> {
        await getHandleFromPath(path, true, true);
    },

    async deleteFile(path: string): Promise<void> {
        // We need parent handle to remove entry
        const relativePath = path.startsWith('/') ? path.slice(1) : path;
        const parts = relativePath.split('/');
        const fileName = parts.pop();
        if (!fileName) throw new Error('Invalid path');

        const parentPath = parts.join('/');
        const parentHandle = parentPath ? await getHandleFromPath(parentPath, false, true) as FileSystemDirectoryHandle : rootHandle;

        if (parentHandle) {
            await parentHandle.removeEntry(fileName);
        }
    },

    async deleteFolder(path: string): Promise<void> {
        const relativePath = path.startsWith('/') ? path.slice(1) : path;
        const parts = relativePath.split('/');
        const folderName = parts.pop();
        if (!folderName) throw new Error('Invalid path');

        const parentPath = parts.join('/');
        const parentHandle = parentPath ? await getHandleFromPath(parentPath, false, true) as FileSystemDirectoryHandle : rootHandle;

        if (parentHandle) {
            await parentHandle.removeEntry(folderName, { recursive: true });
        }
    },

    async exportData(): Promise<{ [key: string]: string | object }> {
        if (!rootHandle) throw new Error('No folder selected');

        const result: { [key: string]: string | object } = {};

        const processDirectory = async (handle: FileSystemDirectoryHandle, currentObj: { [key: string]: string | object }) => {
            for await (const entry of handle.values()) {
                if (entry.name.startsWith('.')) continue; // Skip hidden

                if (entry.kind === 'file') {
                    if (entry.name.endsWith('.md')) {
                        const file = await entry.getFile();
                        currentObj[entry.name] = await file.text();
                    }
                } else if (entry.kind === 'directory') {
                    const folderObj: { [key: string]: string | object } = {};
                    currentObj[entry.name] = folderObj;
                    await processDirectory(entry as FileSystemDirectoryHandle, folderObj);
                }
            }
        };

        await processDirectory(rootHandle, result);
        return result;
    }
} as FileSystemAdapter & {
    openDirectory: () => Promise<void>;
    initialize: () => Promise<void>;
    checkSession: () => Promise<'ready' | 'needs-permission' | 'none'>;
    restoreSession: () => Promise<boolean>;
};
