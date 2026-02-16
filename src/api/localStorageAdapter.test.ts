import { describe, it, expect, beforeEach } from 'vitest';
import { localStorageAdapter, clearStorage } from './localStorageAdapter';
import { get, set, clear } from 'idb-keyval';
import { STORAGE_KEYS } from '../constants';
import type { TreeNode } from '../types';

// Note: fake-indexeddb is automatically imported in test setup

describe('localStorageAdapter', () => {
  beforeEach(async () => {
    // Clear IndexedDB before each test
    await clear();
  });

  describe('fetchTree', () => {
    it('should initialize with default tree when empty', async () => {
      const tree = await localStorageAdapter.fetchTree();

      expect(tree).toHaveLength(2);
      expect(tree[0]).toMatchObject({
        name: 'Welcome.md',
        path: 'Welcome.md',
        type: 'file'
      });
      expect(tree[1]).toMatchObject({
        name: 'Notes',
        path: 'Notes',
        type: 'folder'
      });
    });

    it('should initialize with default file content', async () => {
      await localStorageAdapter.fetchTree();

      const welcomeContent = await get(`${STORAGE_KEYS.CONTENT_PREFIX}Welcome.md`);
      expect(welcomeContent).toContain('Welcome to local storage demo');

      const ideasContent = await get(`${STORAGE_KEYS.CONTENT_PREFIX}Notes/Ideas.md`);
      expect(ideasContent).toContain('My Ideas');
    });

    it('should return existing tree when already initialized', async () => {
      const customTree: TreeNode[] = [
        { name: 'test.md', path: 'test.md', type: 'file' }
      ];
      await set(STORAGE_KEYS.ROOT, customTree);

      const tree = await localStorageAdapter.fetchTree();

      expect(tree).toEqual(customTree);
    });
  });

  describe('fetchDirectories', () => {
    it('should return mock directory structure', async () => {
      const result = await localStorageAdapter.fetchDirectories();

      expect(result).toEqual({
        current: '',
        parent: null,
        directories: []
      });
    });

    it('should return path when provided', async () => {
      const result = await localStorageAdapter.fetchDirectories('some/path');

      expect(result.current).toBe('some/path');
    });
  });

  describe('readFile', () => {
    it('should read file content', async () => {
      const path = 'test.md';
      const content = '# Test Content';
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}${path}`, content);

      const result = await localStorageAdapter.readFile(path);

      expect(result).toBe(content);
    });

    it('should throw error when file does not exist', async () => {
      await expect(
        localStorageAdapter.readFile('nonexistent.md')
      ).rejects.toThrow('File not found');
    });

    it('should read nested file content', async () => {
      const path = 'folder/subfolder/file.md';
      const content = 'Nested content';
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}${path}`, content);

      const result = await localStorageAdapter.readFile(path);

      expect(result).toBe(content);
    });
  });

  describe('saveFile', () => {
    it('should save file content', async () => {
      const path = 'test.md';
      const content = '# New Content';

      await localStorageAdapter.saveFile(path, content);

      const saved = await get(`${STORAGE_KEYS.CONTENT_PREFIX}${path}`);
      expect(saved).toBe(content);
    });

    it('should overwrite existing content', async () => {
      const path = 'test.md';
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}${path}`, 'Old content');

      await localStorageAdapter.saveFile(path, 'New content');

      const saved = await get(`${STORAGE_KEYS.CONTENT_PREFIX}${path}`);
      expect(saved).toBe('New content');
    });

    it('should handle empty content', async () => {
      const path = 'empty.md';

      await localStorageAdapter.saveFile(path, '');

      const saved = await get(`${STORAGE_KEYS.CONTENT_PREFIX}${path}`);
      expect(saved).toBe('');
    });
  });

  describe('createFile', () => {
    beforeEach(async () => {
      // Initialize with empty tree
      await set(STORAGE_KEYS.ROOT, []);
    });

    it('should create a file at root', async () => {
      await localStorageAdapter.createFile('test.md');

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree).toHaveLength(1);
      expect(tree![0]).toMatchObject({
        name: 'test.md',
        path: 'test.md',
        type: 'file'
      });
    });

    it('should auto-append .md extension if missing', async () => {
      await localStorageAdapter.createFile('test');

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree![0].name).toBe('test.md');
      expect(tree![0].path).toBe('test.md');
    });

    it('should not duplicate .md extension', async () => {
      await localStorageAdapter.createFile('test.md');

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree![0].name).toBe('test.md');
      expect(tree![0].path).not.toContain('.md.md');
    });

    it('should initialize file with heading based on filename', async () => {
      await localStorageAdapter.createFile('MyFile.md');

      const content = await get(`${STORAGE_KEYS.CONTENT_PREFIX}MyFile.md`);
      expect(content).toBe('# MyFile\n');
    });

    it('should create file in subfolder', async () => {
      // Create folder first
      await set(STORAGE_KEYS.ROOT, [
        { name: 'folder', path: 'folder', type: 'folder', children: [] }
      ]);

      await localStorageAdapter.createFile('folder/nested.md');

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree![0].children).toHaveLength(1);
      expect(tree![0].children![0]).toMatchObject({
        name: 'nested.md',
        path: 'folder/nested.md',
        type: 'file'
      });
    });

    it('should create file with content key in IndexedDB', async () => {
      await localStorageAdapter.createFile('test.md');

      const content = await get(`${STORAGE_KEYS.CONTENT_PREFIX}test.md`);
      expect(content).toBeDefined();
      expect(typeof content).toBe('string');
    });
  });

  describe('createFolder', () => {
    beforeEach(async () => {
      await set(STORAGE_KEYS.ROOT, []);
    });

    it('should create a folder at root', async () => {
      await localStorageAdapter.createFolder('MyFolder');

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree).toHaveLength(1);
      expect(tree![0]).toMatchObject({
        name: 'MyFolder',
        path: 'MyFolder',
        type: 'folder',
        children: []
      });
    });

    it('should create nested folder', async () => {
      await set(STORAGE_KEYS.ROOT, [
        { name: 'parent', path: 'parent', type: 'folder', children: [] }
      ]);

      await localStorageAdapter.createFolder('parent/child');

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree![0].children).toHaveLength(1);
      expect(tree![0].children![0]).toMatchObject({
        name: 'child',
        path: 'parent/child',
        type: 'folder'
      });
    });

    it('should initialize folder with empty children array', async () => {
      await localStorageAdapter.createFolder('MyFolder');

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree![0].children).toEqual([]);
    });
  });

  describe('deleteFile', () => {
    beforeEach(async () => {
      await set(STORAGE_KEYS.ROOT, [
        { name: 'file1.md', path: 'file1.md', type: 'file' },
        { name: 'file2.md', path: 'file2.md', type: 'file' }
      ]);
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}file1.md`, 'Content 1');
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}file2.md`, 'Content 2');
    });

    it('should delete file from tree', async () => {
      await localStorageAdapter.deleteFile('file1.md');

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree).toHaveLength(1);
      expect(tree![0].name).toBe('file2.md');
    });

    it('should delete file content from IndexedDB', async () => {
      await localStorageAdapter.deleteFile('file1.md');

      const content = await get(`${STORAGE_KEYS.CONTENT_PREFIX}file1.md`);
      expect(content).toBeUndefined();
    });

    it('should handle deleting nested file', async () => {
      await set(STORAGE_KEYS.ROOT, [
        {
          name: 'folder',
          path: 'folder',
          type: 'folder',
          children: [
            { name: 'nested.md', path: 'folder/nested.md', type: 'file' }
          ]
        }
      ]);
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}folder/nested.md`, 'Nested content');

      await localStorageAdapter.deleteFile('folder/nested.md');

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree![0].children).toHaveLength(0);

      const content = await get(`${STORAGE_KEYS.CONTENT_PREFIX}folder/nested.md`);
      expect(content).toBeUndefined();
    });

    it('should do nothing if file does not exist', async () => {
      const treeBefore = await get<TreeNode[]>(STORAGE_KEYS.ROOT);

      await localStorageAdapter.deleteFile('nonexistent.md');

      const treeAfter = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(treeAfter).toEqual(treeBefore);
    });
  });

  describe('deleteFolder', () => {
    beforeEach(async () => {
      await set(STORAGE_KEYS.ROOT, [
        {
          name: 'folder',
          path: 'folder',
          type: 'folder',
          children: [
            { name: 'file1.md', path: 'folder/file1.md', type: 'file' },
            { name: 'file2.md', path: 'folder/file2.md', type: 'file' }
          ]
        }
      ]);
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}folder/file1.md`, 'Content 1');
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}folder/file2.md`, 'Content 2');
    });

    it('should delete folder from tree', async () => {
      await localStorageAdapter.deleteFolder('folder');

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree).toHaveLength(0);
    });

    it('should delete all file contents inside folder', async () => {
      await localStorageAdapter.deleteFolder('folder');

      const content1 = await get(`${STORAGE_KEYS.CONTENT_PREFIX}folder/file1.md`);
      const content2 = await get(`${STORAGE_KEYS.CONTENT_PREFIX}folder/file2.md`);

      expect(content1).toBeUndefined();
      expect(content2).toBeUndefined();
    });

    it('should handle nested folders with files', async () => {
      await set(STORAGE_KEYS.ROOT, [
        {
          name: 'parent',
          path: 'parent',
          type: 'folder',
          children: [
            {
              name: 'child',
              path: 'parent/child',
              type: 'folder',
              children: [
                { name: 'deep.md', path: 'parent/child/deep.md', type: 'file' }
              ]
            }
          ]
        }
      ]);
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}parent/child/deep.md`, 'Deep content');

      await localStorageAdapter.deleteFolder('parent');

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree).toHaveLength(0);

      const content = await get(`${STORAGE_KEYS.CONTENT_PREFIX}parent/child/deep.md`);
      expect(content).toBeUndefined();
    });

    it('should do nothing if folder does not exist', async () => {
      const treeBefore = await get<TreeNode[]>(STORAGE_KEYS.ROOT);

      await localStorageAdapter.deleteFolder('nonexistent');

      const treeAfter = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(treeAfter).toEqual(treeBefore);
    });
  });

  describe('exportData', () => {
    it('should export flat file structure', async () => {
      await set(STORAGE_KEYS.ROOT, [
        { name: 'file1.md', path: 'file1.md', type: 'file' },
        { name: 'file2.md', path: 'file2.md', type: 'file' }
      ]);
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}file1.md`, 'Content 1');
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}file2.md`, 'Content 2');

      const exported = await localStorageAdapter.exportData();

      expect(exported).toEqual({
        'file1.md': 'Content 1',
        'file2.md': 'Content 2'
      });
    });

    it('should export nested folder structure', async () => {
      await set(STORAGE_KEYS.ROOT, [
        { name: 'file.md', path: 'file.md', type: 'file' },
        {
          name: 'folder',
          path: 'folder',
          type: 'folder',
          children: [
            { name: 'nested.md', path: 'folder/nested.md', type: 'file' }
          ]
        }
      ]);
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}file.md`, 'Root content');
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}folder/nested.md`, 'Nested content');

      const exported = await localStorageAdapter.exportData();

      expect(exported).toEqual({
        'file.md': 'Root content',
        'folder': {
          'nested.md': 'Nested content'
        }
      });
    });

    it('should handle deeply nested structure', async () => {
      await set(STORAGE_KEYS.ROOT, [
        {
          name: 'level1',
          path: 'level1',
          type: 'folder',
          children: [
            {
              name: 'level2',
              path: 'level1/level2',
              type: 'folder',
              children: [
                { name: 'deep.md', path: 'level1/level2/deep.md', type: 'file' }
              ]
            }
          ]
        }
      ]);
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}level1/level2/deep.md`, 'Deep content');

      const exported = await localStorageAdapter.exportData();

      expect(exported).toEqual({
        level1: {
          level2: {
            'deep.md': 'Deep content'
          }
        }
      });
    });

    it('should handle missing file content gracefully', async () => {
      await set(STORAGE_KEYS.ROOT, [
        { name: 'file.md', path: 'file.md', type: 'file' }
      ]);
      // Don't set content

      const exported = await localStorageAdapter.exportData();

      expect(exported).toEqual({
        'file.md': ''
      });
    });

    it('should return empty object for empty tree', async () => {
      await set(STORAGE_KEYS.ROOT, []);

      const exported = await localStorageAdapter.exportData();

      expect(exported).toEqual({});
    });
  });

  describe('importData', () => {
    it('should import flat file structure', async () => {
      const data = {
        'file1.md': 'Content 1',
        'file2.md': 'Content 2'
      };

      await localStorageAdapter.importData(data);

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree).toHaveLength(2);
      expect(tree![0].name).toBe('file1.md');
      expect(tree![1].name).toBe('file2.md');

      const content1 = await get(`${STORAGE_KEYS.CONTENT_PREFIX}file1.md`);
      const content2 = await get(`${STORAGE_KEYS.CONTENT_PREFIX}file2.md`);
      expect(content1).toBe('Content 1');
      expect(content2).toBe('Content 2');
    });

    it('should import nested folder structure', async () => {
      const data = {
        'root.md': 'Root content',
        'folder': {
          'nested.md': 'Nested content'
        }
      };

      await localStorageAdapter.importData(data);

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree).toHaveLength(2);
      expect(tree![1].type).toBe('folder');
      expect(tree![1].name).toBe('folder');
      expect(tree![1].children).toHaveLength(1);
      expect(tree![1].children![0].name).toBe('nested.md');

      const nestedContent = await get(`${STORAGE_KEYS.CONTENT_PREFIX}folder/nested.md`);
      expect(nestedContent).toBe('Nested content');
    });

    it('should clear existing data before import', async () => {
      // Set up existing data
      await set(STORAGE_KEYS.ROOT, [
        { name: 'old.md', path: 'old.md', type: 'file' }
      ]);
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}old.md`, 'Old content');

      // Import new data
      const data = {
        'new.md': 'New content'
      };
      await localStorageAdapter.importData(data);

      // Old data should be gone
      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree).toHaveLength(1);
      expect(tree![0].name).toBe('new.md');

      const oldContent = await get(`${STORAGE_KEYS.CONTENT_PREFIX}old.md`);
      expect(oldContent).toBeUndefined();
    });

    it('should set version when provided', async () => {
      const data = { 'test.md': 'Test' };

      await localStorageAdapter.importData(data, '1.0.0');

      const version = await get(STORAGE_KEYS.VERSION);
      expect(version).toBe('1.0.0');
    });

    it('should handle deeply nested import', async () => {
      const data = {
        level1: {
          level2: {
            level3: {
              'deep.md': 'Deep content'
            }
          }
        }
      };

      await localStorageAdapter.importData(data);

      const tree = await get<TreeNode[]>(STORAGE_KEYS.ROOT);
      expect(tree).toBeDefined();
      expect(tree![0].type).toBe('folder');
      expect(tree![0].children![0].type).toBe('folder');
      expect(tree![0].children![0].children![0].type).toBe('folder');
      expect(tree![0].children![0].children![0].children![0].type).toBe('file');

      const content = await get(`${STORAGE_KEYS.CONTENT_PREFIX}level1/level2/level3/deep.md`);
      expect(content).toBe('Deep content');
    });
  });

  describe('getNoteCount', () => {
    it('should return 0 for empty storage', async () => {
      const count = await localStorageAdapter.getNoteCount();
      expect(count).toBe(0);
    });

    it('should count file content keys', async () => {
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}file1.md`, 'Content 1');
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}file2.md`, 'Content 2');
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}file3.md`, 'Content 3');

      const count = await localStorageAdapter.getNoteCount();
      expect(count).toBe(3);
    });

    it('should not count non-content keys', async () => {
      await set(STORAGE_KEYS.ROOT, []);
      await set(STORAGE_KEYS.VERSION, '1.0.0');
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}file1.md`, 'Content');
      await set('some-other-key', 'Other data');

      const count = await localStorageAdapter.getNoteCount();
      expect(count).toBe(1);
    });
  });

  describe('getVersion', () => {
    it('should return null when no version is set', async () => {
      const version = await localStorageAdapter.getVersion();
      expect(version).toBeNull();
    });

    it('should return stored version', async () => {
      await set(STORAGE_KEYS.VERSION, '2.5.0');

      const version = await localStorageAdapter.getVersion();
      expect(version).toBe('2.5.0');
    });
  });

  describe('setVersion', () => {
    it('should store version', async () => {
      await localStorageAdapter.setVersion('3.0.0');

      const version = await get(STORAGE_KEYS.VERSION);
      expect(version).toBe('3.0.0');
    });

    it('should overwrite existing version', async () => {
      await set(STORAGE_KEYS.VERSION, '1.0.0');

      await localStorageAdapter.setVersion('2.0.0');

      const version = await get(STORAGE_KEYS.VERSION);
      expect(version).toBe('2.0.0');
    });
  });

  describe('clearStorage', () => {
    it('should clear all app-related keys', async () => {
      await set(STORAGE_KEYS.ROOT, []);
      await set(STORAGE_KEYS.VERSION, '1.0.0');
      await set(`${STORAGE_KEYS.CONTENT_PREFIX}file.md`, 'Content');

      await clearStorage();

      const root = await get(STORAGE_KEYS.ROOT);
      const version = await get(STORAGE_KEYS.VERSION);
      const content = await get(`${STORAGE_KEYS.CONTENT_PREFIX}file.md`);

      expect(root).toBeUndefined();
      expect(version).toBeUndefined();
      expect(content).toBeUndefined();
    });

    it('should not clear unrelated keys', async () => {
      await set('my-custom-key', 'My data');
      await set(STORAGE_KEYS.ROOT, []);

      await clearStorage();

      const customData = await get('my-custom-key');
      expect(customData).toBe('My data');
    });

    it('should handle empty storage', async () => {
      await expect(clearStorage()).resolves.not.toThrow();
    });
  });
});
