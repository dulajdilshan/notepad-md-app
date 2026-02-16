
import type { TreeNode } from '../types';
import { get, set, del, keys } from 'idb-keyval';
import { STORAGE_KEYS } from '../constants';
import { addNodeToTree, removeNodeFromTree, findAndRemoveNode, collectFilePaths } from '../utils/treeUtils';

const { ROOT: ROOT_KEY, CONTENT_PREFIX, VERSION: VERSION_KEY } = STORAGE_KEYS;

// Initial state for the demo
const INITIAL_TREE: TreeNode[] = [
    {
        name: 'Welcome.md',
        path: 'Welcome.md',
        type: 'file'
    },
    {
        name: 'Notes',
        path: 'Notes',
        type: 'folder',
        children: [
            {
                name: 'Ideas.md',
                path: 'Notes/Ideas.md',
                type: 'file'
            }
        ]
    }
];

const INITIAL_FILES = {
    'Welcome.md': '# Welcome to local storage demo\n\nThis is a demo mode for browsers that do not support direct file access (like Safari).\n\nYour notes are stored in your **browser\'s local storage**.\nThey will persist here, but are not saved to your computer\'s hard drive.\n\n### Features\n- Create files and folders\n- Edit markdown\n- Todo lists\n',
    'Notes/Ideas.md': '# My Ideas\n\n- [ ] Build a cool app\n- [x] Learn React\n'
};

export const localStorageAdapter = {
    async fetchTree(): Promise<TreeNode[]> {
        let tree = await get<TreeNode[]>(ROOT_KEY);
        if (!tree) {
            // Initialize if empty
            await set(ROOT_KEY, INITIAL_TREE);
            for (const [path, content] of Object.entries(INITIAL_FILES)) {
                await set(CONTENT_PREFIX + path, content);
            }
            tree = INITIAL_TREE;
        }
        return tree;
    },

    async fetchDirectories(path?: string): Promise<{ current: string; parent: string | null; directories: string[] }> {
        // Mock directory fetching for picker (not really used in this mode usually)
        return { current: path || '', parent: null, directories: [] };
    },

    async readFile(path: string): Promise<string> {
        const content = await get<string>(CONTENT_PREFIX + path);
        if (content === undefined) throw new Error('File not found');
        return content;
    },

    async saveFile(path: string, content: string): Promise<void> {
        await set(CONTENT_PREFIX + path, content);
    },

    async createFile(path: string): Promise<void> {
        // Auto-append .md extension if missing
        if (!path.endsWith('.md')) {
            path += '.md';
        }

        const tree = await get<TreeNode[]>(ROOT_KEY) || [];

        const parts = path.split('/');
        const fileName = parts.pop()!;
        const parentPath = parts.join('/');

        // Add to tree
        addNodeToTree(tree, parentPath, {
            name: fileName,
            path: parentPath ? `${parentPath}/${fileName}` : fileName,
            type: 'file',
        });
        await set(ROOT_KEY, tree);

        // Initialize content
        const name = fileName.replace('.md', '');
        await set(CONTENT_PREFIX + path, `# ${name}\n`);
    },

    async createFolder(path: string): Promise<void> {
        const tree = await get<TreeNode[]>(ROOT_KEY) || [];

        const parts = path.split('/');
        const folderName = parts.pop()!;
        const parentPath = parts.join('/');

        addNodeToTree(tree, parentPath, {
            name: folderName,
            path: parentPath ? `${parentPath}/${folderName}` : folderName,
            type: 'folder',
            children: [],
        });
        await set(ROOT_KEY, tree);
    },

    async deleteFile(path: string): Promise<void> {
        const tree = await get<TreeNode[]>(ROOT_KEY) || [];

        if (removeNodeFromTree(tree, path)) {
            await set(ROOT_KEY, tree);
            await del(CONTENT_PREFIX + path);
        }
    },

    async deleteFolder(path: string): Promise<void> {
        const tree = await get<TreeNode[]>(ROOT_KEY) || [];

        const removedFolder = findAndRemoveNode(tree, path);
        if (removedFolder) {
            await set(ROOT_KEY, tree);
            // Delete content of all files inside
            const filePaths = collectFilePaths(removedFolder.children || []);
            for (const p of filePaths) {
                await del(CONTENT_PREFIX + p);
            }
        }
    },

    async exportData(): Promise<{ [key: string]: string | object }> {
        const tree = await get<TreeNode[]>(ROOT_KEY) || [];
        const result: { [key: string]: string | object } = {};

        const processNode = async (nodes: TreeNode[], currentObj: { [key: string]: string | object }) => {
            for (const node of nodes) {
                if (node.type === 'file') {
                    const content = await get<string>(CONTENT_PREFIX + node.path);
                    currentObj[node.name] = content || '';
                } else if (node.type === 'folder') {
                    const folderObj: { [key: string]: string | object } = {};
                    currentObj[node.name] = folderObj;
                    if (node.children) {
                        await processNode(node.children, folderObj);
                    }
                }
            }
        };

        await processNode(tree, result);
        return result;
    },

    async importData(data: { [key: string]: any }, version?: string): Promise<void> {
        await clearStorage();
        const tree: TreeNode[] = [];

        const processImport = async (currentData: { [key: string]: any }, currentPath: string, currentNodes: TreeNode[]) => {
            for (const [name, value] of Object.entries(currentData)) {
                if (typeof value === 'string') {
                    // It's a file
                    const path = currentPath ? `${currentPath}/${name}` : name;
                    currentNodes.push({ name, path, type: 'file' });
                    await set(CONTENT_PREFIX + path, value);
                } else if (typeof value === 'object' && value !== null) {
                    // It's a folder
                    const path = currentPath ? `${currentPath}/${name}` : name;
                    const folderNode: TreeNode = { name, path, type: 'folder', children: [] };
                    currentNodes.push(folderNode);
                    await processImport(value, path, folderNode.children!);
                }
            }
        };

        await processImport(data, '', tree);

        await set(ROOT_KEY, tree);

        if (version) {
            await set(VERSION_KEY, version);
        }
    },

    async getNoteCount(): Promise<number> {
        const allKeys = await keys();
        return allKeys.filter(k => typeof k === 'string' && k.startsWith(CONTENT_PREFIX)).length;
    },

    async getVersion(): Promise<string | null> {
        return await get<string>(VERSION_KEY) || null;
    },

    async setVersion(version: string): Promise<void> {
        await set(VERSION_KEY, version);
    }
};

export async function clearStorage(): Promise<void> {
    // Clear all keys that match our prefixes
    const allKeys = await import('idb-keyval').then(m => m.keys());
    for (const key of allKeys) {
        if (typeof key === 'string' && (key === ROOT_KEY || key.startsWith(CONTENT_PREFIX) || key === VERSION_KEY)) {
            await del(key);
        }
    }
}
