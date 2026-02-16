import type { TreeNode } from '../types';

export function addNodeToTree(
    nodes: TreeNode[],
    parentPath: string,
    newNode: TreeNode
): boolean {
    if (!parentPath) {
        if (nodes.some(n => n.name === newNode.name)) return false;
        nodes.push(newNode);
        return true;
    }

    for (const node of nodes) {
        if (node.type === 'folder') {
            if (node.path === parentPath) {
                if (!node.children) node.children = [];
                if (node.children.some(n => n.name === newNode.name)) return false;
                node.children.push(newNode);
                return true;
            }
            if (node.children && addNodeToTree(node.children, parentPath, newNode)) return true;
        }
    }
    return false;
}

export function removeNodeFromTree(nodes: TreeNode[], targetPath: string): boolean {
    const index = nodes.findIndex(n => n.path === targetPath);
    if (index !== -1) {
        nodes.splice(index, 1);
        return true;
    }
    for (const node of nodes) {
        if (node.type === 'folder' && node.children) {
            if (removeNodeFromTree(node.children, targetPath)) return true;
        }
    }
    return false;
}

export function findAndRemoveNode(nodes: TreeNode[], targetPath: string): TreeNode | null {
    const index = nodes.findIndex(n => n.path === targetPath);
    if (index !== -1) {
        const [removed] = nodes.splice(index, 1);
        return removed;
    }
    for (const node of nodes) {
        if (node.type === 'folder' && node.children) {
            const removed = findAndRemoveNode(node.children, targetPath);
            if (removed) return removed;
        }
    }
    return null;
}

export function collectFilePaths(nodes: TreeNode[]): string[] {
    let paths: string[] = [];
    for (const node of nodes) {
        if (node.type === 'file') paths.push(node.path);
        if (node.type === 'folder' && node.children) {
            paths = [...paths, ...collectFilePaths(node.children)];
        }
    }
    return paths;
}
