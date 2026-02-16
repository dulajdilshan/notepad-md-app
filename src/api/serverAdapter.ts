import type { FileSystemAdapter } from './interfaces';
import type { TreeNode } from '../types';

function getHeaders() {
    const headers: Record<string, string> = {};
    const rootPath = localStorage.getItem('rootPath');
    if (rootPath) {
        headers['x-root-path'] = rootPath;
    }
    return headers;
}

export const serverAdapter: FileSystemAdapter = {
    async fetchTree(): Promise<TreeNode[]> {
        const res = await fetch('/api/tree', {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch tree');
        return res.json();
    },

    async fetchDirectories(path?: string): Promise<{ current: string; parent: string | null; directories: string[] }> {
        const url = path ? `/api/directories?path=${encodeURIComponent(path)}` : '/api/directories';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch directories');
        return res.json();
    },

    async readFile(path: string): Promise<string> {
        const headers = getHeaders();
        const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, {
            headers: headers,
        });
        if (!res.ok) throw new Error('Failed to fetch file');
        const data = await res.json();
        return data.content;
    },

    async saveFile(path: string, content: string): Promise<void> {
        const res = await fetch('/api/file', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getHeaders() },
            body: JSON.stringify({ path, content }),
        });
        if (!res.ok) throw new Error('Failed to save file');
    },

    async createFile(path: string): Promise<void> {
        const res = await fetch('/api/file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getHeaders() },
            body: JSON.stringify({ path }),
        });
        if (!res.ok) throw new Error('Failed to create file');
    },

    async createFolder(path: string): Promise<void> {
        const res = await fetch('/api/folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getHeaders() },
            body: JSON.stringify({ path }),
        });
        if (!res.ok) throw new Error('Failed to create folder');
    },

    async deleteFile(path: string): Promise<void> {
        const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error('Failed to delete file');
    },

    async deleteFolder(path: string): Promise<void> {
        const res = await fetch(`/api/folder?path=${encodeURIComponent(path)}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error('Failed to delete folder');
    }
};
