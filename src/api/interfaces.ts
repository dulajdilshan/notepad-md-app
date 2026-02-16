import type { TreeNode } from '../types';

export interface FileSystemAdapter {
    fetchTree(): Promise<TreeNode[]>;
    fetchDirectories(path?: string): Promise<{ current: string; parent: string | null; directories: string[] }>;
    readFile(path: string): Promise<string>;
    saveFile(path: string, content: string): Promise<void>;
    createFile(path: string): Promise<void>;
    createFolder(path: string): Promise<void>;
    deleteFile(path: string): Promise<void>;
    deleteFolder(path: string): Promise<void>;
}
