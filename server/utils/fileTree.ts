import fs from 'fs';
import path from 'path';

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
}

const EXCLUDED_DIRS = new Set(['notepad-md-app', 'node_modules', '.git']);

export function buildFileTree(rootDir: string, relativePath = ''): TreeNode[] {
  const absolutePath = path.join(rootDir, relativePath);
  const entries = fs.readdirSync(absolutePath, { withFileTypes: true });
  const nodes: TreeNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (EXCLUDED_DIRS.has(entry.name)) continue;

    const entryRelPath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path: entryRelPath,
        type: 'folder',
        children: buildFileTree(rootDir, entryRelPath),
      });
    } else if (entry.name.endsWith('.md')) {
      nodes.push({
        name: entry.name,
        path: entryRelPath,
        type: 'file',
      });
    }
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}
