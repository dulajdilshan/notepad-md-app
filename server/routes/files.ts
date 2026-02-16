import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { buildFileTree } from '../utils/fileTree.js';

const DEFAULT_ROOT = path.resolve(import.meta.dirname, '../../..');

const getRootPath = (req: Request): string => {
  const headerPath = req.headers['x-root-path'] as string;
  // If user provides a path, we try to use it.
  // We should probably validate it exists, or create it if strict.
  // For now, let's verify it exists and is a directory.
  if (headerPath) {
    try {
      if (fs.existsSync(headerPath) && fs.statSync(headerPath).isDirectory()) {
        return headerPath;
      }
    } catch (e) {
      console.warn('Invalid root path header:', headerPath);
    }
  }
  return DEFAULT_ROOT;
};

function sanitizePath(rootPath: string, userPath: string): string | null {
  const resolved = path.resolve(rootPath, userPath);
  if (!resolved.startsWith(rootPath)) return null;
  return resolved;
}

const router = Router();

// GET /api/directories?path=X - List directories in path
router.get('/directories', (req: Request, res: Response) => {
  try {
    const queryPath = req.query.path as string;
    const currentPath = queryPath ? path.resolve(queryPath) : os.homedir();

    // specific check to prevent going above root if we wanted to enforce it, 
    // but for a "picker" we want to explore the whole system usually.
    // However, we might want to prevent reading restricted system dirs if possible,
    // but that's hard to get right cross-platform without native modules.
    // For this app, we'll assume the user running the server has permissions they are okay with using.

    if (!fs.existsSync(currentPath) || !fs.statSync(currentPath).isDirectory()) {
      res.status(400).json({ error: 'Invalid path' });
      return;
    }

    const items = fs.readdirSync(currentPath, { withFileTypes: true });
    const directories = items
      .filter(item => item.isDirectory() && !item.name.startsWith('.')) // hide hidden dirs for cleanliness?
      .map(item => item.name);

    const parent = path.dirname(currentPath);
    // If we are at root, parent is same as current on some systems, or we can check.
    const isRoot = parent === currentPath;

    res.json({
      current: currentPath,
      parent: isRoot ? null : parent,
      directories
    });
  } catch (err) {
    console.error('Failed to list directories:', err);
    res.status(500).json({ error: 'Failed to list directories' });
  }
});

// GET /api/tree - Return full directory tree
router.get('/tree', (req: Request, res: Response) => {
  try {
    const rootPath = getRootPath(req);
    const tree = buildFileTree(rootPath);
    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read directory tree' });
  }
});

// GET /api/file?path=X - Read markdown file
router.get('/file', (req: Request, res: Response) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    res.status(400).json({ error: 'Missing path parameter' });
    return;
  }

  const rootPath = getRootPath(req);
  const safePath = sanitizePath(rootPath, filePath);
  if (!safePath) {
    res.status(403).json({ error: 'Invalid path' });
    return;
  }

  try {
    const content = fs.readFileSync(safePath, 'utf-8');
    res.json({ content });
  } catch {
    res.status(404).json({ error: 'File not found' });
  }
});

// PUT /api/file - Save/update file content
router.put('/file', (req: Request, res: Response) => {
  const { path: filePath, content } = req.body;
  if (!filePath || content === undefined) {
    res.status(400).json({ error: 'Missing path or content' });
    return;
  }

  const rootPath = getRootPath(req);
  const safePath = sanitizePath(rootPath, filePath);
  if (!safePath) {
    res.status(403).json({ error: 'Invalid path' });
    return;
  }

  try {
    fs.writeFileSync(safePath, content, 'utf-8');
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// POST /api/file - Create new markdown file
router.post('/file', (req: Request, res: Response) => {
  const { path: filePath } = req.body;
  if (!filePath) {
    res.status(400).json({ error: 'Missing path' });
    return;
  }

  const rootPath = getRootPath(req);
  const fullPath = filePath.endsWith('.md') ? filePath : `${filePath}.md`;
  const safePath = sanitizePath(rootPath, fullPath);
  if (!safePath) {
    res.status(403).json({ error: 'Invalid path' });
    return;
  }

  if (fs.existsSync(safePath)) {
    res.status(409).json({ error: 'File already exists' });
    return;
  }

  try {
    const dir = path.dirname(safePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(safePath, `# ${path.basename(fullPath, '.md')}\n`, 'utf-8');
    res.json({ success: true, path: fullPath });
  } catch {
    res.status(500).json({ error: 'Failed to create file' });
  }
});

// POST /api/folder - Create new folder
router.post('/folder', (req: Request, res: Response) => {
  const { path: folderPath } = req.body;
  if (!folderPath) {
    res.status(400).json({ error: 'Missing path' });
    return;
  }

  const rootPath = getRootPath(req);
  const safePath = sanitizePath(rootPath, folderPath);
  if (!safePath) {
    res.status(403).json({ error: 'Invalid path' });
    return;
  }

  if (fs.existsSync(safePath)) {
    res.status(409).json({ error: 'Folder already exists' });
    return;
  }

  try {
    fs.mkdirSync(safePath, { recursive: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// DELETE /api/file - Delete a file
router.delete('/file', (req: Request, res: Response) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    res.status(400).json({ error: 'Missing path parameter' });
    return;
  }

  const rootPath = getRootPath(req);
  const safePath = sanitizePath(rootPath, filePath);
  if (!safePath) {
    res.status(403).json({ error: 'Invalid path' });
    return;
  }

  try {
    if (!fs.existsSync(safePath)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    fs.unlinkSync(safePath);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// DELETE /api/folder - Delete a folder
router.delete('/folder', (req: Request, res: Response) => {
  const folderPath = req.query.path as string;
  if (!folderPath) {
    res.status(400).json({ error: 'Missing path parameter' });
    return;
  }

  const rootPath = getRootPath(req);
  const safePath = sanitizePath(rootPath, folderPath);
  if (!safePath) {
    res.status(403).json({ error: 'Invalid path' });
    return;
  }

  try {
    if (!fs.existsSync(safePath)) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }
    fs.rmSync(safePath, { recursive: true, force: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

export default router;
