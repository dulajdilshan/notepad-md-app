import { describe, it, expect, beforeEach } from 'vitest';
import { addNodeToTree, removeNodeFromTree, findAndRemoveNode, collectFilePaths } from './treeUtils';
import type { TreeNode } from '../types';

describe('treeUtils', () => {
  describe('addNodeToTree', () => {
    let nodes: TreeNode[];

    beforeEach(() => {
      nodes = [
        { name: 'file1.md', path: '/file1.md', type: 'file' },
        {
          name: 'folder1',
          path: '/folder1',
          type: 'folder',
          children: [
            { name: 'nested.md', path: '/folder1/nested.md', type: 'file' }
          ]
        }
      ];
    });

    it('should add a node to the root when parentPath is empty', () => {
      const newNode: TreeNode = { name: 'file2.md', path: '/file2.md', type: 'file' };
      const result = addNodeToTree(nodes, '', newNode);
      
      expect(result).toBe(true);
      expect(nodes).toHaveLength(3);
      expect(nodes[2]).toEqual(newNode);
    });

    it('should not add a duplicate node at root', () => {
      const newNode: TreeNode = { name: 'file1.md', path: '/file1.md', type: 'file' };
      const result = addNodeToTree(nodes, '', newNode);
      
      expect(result).toBe(false);
      expect(nodes).toHaveLength(2);
    });

    it('should add a node to a specific folder', () => {
      const newNode: TreeNode = { name: 'new.md', path: '/folder1/new.md', type: 'file' };
      const result = addNodeToTree(nodes, '/folder1', newNode);
      
      expect(result).toBe(true);
      const folder = nodes[1] as TreeNode;
      expect(folder.children).toHaveLength(2);
      expect(folder.children![1]).toEqual(newNode);
    });

    it('should not add a duplicate node to a folder', () => {
      const newNode: TreeNode = { name: 'nested.md', path: '/folder1/nested.md', type: 'file' };
      const result = addNodeToTree(nodes, '/folder1', newNode);
      
      expect(result).toBe(false);
      const folder = nodes[1] as TreeNode;
      expect(folder.children).toHaveLength(1);
    });

    it('should initialize children array if it does not exist', () => {
      const folderWithoutChildren: TreeNode = { name: 'empty', path: '/empty', type: 'folder' };
      nodes.push(folderWithoutChildren);
      
      const newNode: TreeNode = { name: 'file.md', path: '/empty/file.md', type: 'file' };
      const result = addNodeToTree(nodes, '/empty', newNode);
      
      expect(result).toBe(true);
      expect(folderWithoutChildren.children).toBeDefined();
      expect(folderWithoutChildren.children).toHaveLength(1);
    });

    it('should handle deeply nested folders', () => {
      const deepFolder: TreeNode = {
        name: 'level1',
        path: '/level1',
        type: 'folder',
        children: [
          {
            name: 'level2',
            path: '/level1/level2',
            type: 'folder',
            children: []
          }
        ]
      };
      nodes.push(deepFolder);
      
      const newNode: TreeNode = { name: 'deep.md', path: '/level1/level2/deep.md', type: 'file' };
      const result = addNodeToTree(nodes, '/level1/level2', newNode);
      
      expect(result).toBe(true);
      expect(deepFolder.children![0].children![0]).toEqual(newNode);
    });

    it('should return false when parent path is not found', () => {
      const newNode: TreeNode = { name: 'file.md', path: '/nonexistent/file.md', type: 'file' };
      const result = addNodeToTree(nodes, '/nonexistent', newNode);
      
      expect(result).toBe(false);
    });
  });

  describe('removeNodeFromTree', () => {
    let nodes: TreeNode[];

    beforeEach(() => {
      nodes = [
        { name: 'file1.md', path: '/file1.md', type: 'file' },
        { name: 'file2.md', path: '/file2.md', type: 'file' },
        {
          name: 'folder1',
          path: '/folder1',
          type: 'folder',
          children: [
            { name: 'nested.md', path: '/folder1/nested.md', type: 'file' },
            { name: 'nested2.md', path: '/folder1/nested2.md', type: 'file' }
          ]
        }
      ];
    });

    it('should remove a node from root', () => {
      const result = removeNodeFromTree(nodes, '/file1.md');
      
      expect(result).toBe(true);
      expect(nodes).toHaveLength(2);
      expect(nodes.find(n => n.path === '/file1.md')).toBeUndefined();
    });

    it('should remove a nested node', () => {
      const result = removeNodeFromTree(nodes, '/folder1/nested.md');
      
      expect(result).toBe(true);
      const folder = nodes[2] as TreeNode;
      expect(folder.children).toHaveLength(1);
      expect(folder.children![0].path).toBe('/folder1/nested2.md');
    });

    it('should remove a folder with children', () => {
      const result = removeNodeFromTree(nodes, '/folder1');
      
      expect(result).toBe(true);
      expect(nodes).toHaveLength(2);
      expect(nodes.find(n => n.path === '/folder1')).toBeUndefined();
    });

    it('should return false when node is not found', () => {
      const result = removeNodeFromTree(nodes, '/nonexistent.md');
      
      expect(result).toBe(false);
      expect(nodes).toHaveLength(3);
    });

    it('should handle deeply nested removal', () => {
      const deepFolder: TreeNode = {
        name: 'level1',
        path: '/level1',
        type: 'folder',
        children: [
          {
            name: 'level2',
            path: '/level1/level2',
            type: 'folder',
            children: [
              { name: 'deep.md', path: '/level1/level2/deep.md', type: 'file' }
            ]
          }
        ]
      };
      nodes.push(deepFolder);
      
      const result = removeNodeFromTree(nodes, '/level1/level2/deep.md');
      
      expect(result).toBe(true);
      expect(deepFolder.children![0].children).toHaveLength(0);
    });
  });

  describe('findAndRemoveNode', () => {
    let nodes: TreeNode[];

    beforeEach(() => {
      nodes = [
        { name: 'file1.md', path: '/file1.md', type: 'file' },
        {
          name: 'folder1',
          path: '/folder1',
          type: 'folder',
          children: [
            { name: 'nested.md', path: '/folder1/nested.md', type: 'file' }
          ]
        }
      ];
    });

    it('should find and remove a node from root', () => {
      const removed = findAndRemoveNode(nodes, '/file1.md');
      
      expect(removed).toEqual({ name: 'file1.md', path: '/file1.md', type: 'file' });
      expect(nodes).toHaveLength(1);
    });

    it('should find and remove a nested node', () => {
      const removed = findAndRemoveNode(nodes, '/folder1/nested.md');
      
      expect(removed).toEqual({ name: 'nested.md', path: '/folder1/nested.md', type: 'file' });
      const folder = nodes[1] as TreeNode;
      expect(folder.children).toHaveLength(0);
    });

    it('should return null when node is not found', () => {
      const removed = findAndRemoveNode(nodes, '/nonexistent.md');
      
      expect(removed).toBeNull();
      expect(nodes).toHaveLength(2);
    });

    it('should return the removed folder with all its children', () => {
      const removed = findAndRemoveNode(nodes, '/folder1');
      
      expect(removed).toEqual({
        name: 'folder1',
        path: '/folder1',
        type: 'folder',
        children: [
          { name: 'nested.md', path: '/folder1/nested.md', type: 'file' }
        ]
      });
      expect(nodes).toHaveLength(1);
    });
  });

  describe('collectFilePaths', () => {
    it('should collect all file paths from flat structure', () => {
      const nodes: TreeNode[] = [
        { name: 'file1.md', path: '/file1.md', type: 'file' },
        { name: 'file2.md', path: '/file2.md', type: 'file' }
      ];
      
      const paths = collectFilePaths(nodes);
      
      expect(paths).toEqual(['/file1.md', '/file2.md']);
    });

    it('should collect file paths from nested structure', () => {
      const nodes: TreeNode[] = [
        { name: 'file1.md', path: '/file1.md', type: 'file' },
        {
          name: 'folder1',
          path: '/folder1',
          type: 'folder',
          children: [
            { name: 'nested.md', path: '/folder1/nested.md', type: 'file' },
            { name: 'nested2.md', path: '/folder1/nested2.md', type: 'file' }
          ]
        }
      ];
      
      const paths = collectFilePaths(nodes);
      
      expect(paths).toEqual(['/file1.md', '/folder1/nested.md', '/folder1/nested2.md']);
    });

    it('should handle deeply nested structures', () => {
      const nodes: TreeNode[] = [
        {
          name: 'level1',
          path: '/level1',
          type: 'folder',
          children: [
            {
              name: 'level2',
              path: '/level1/level2',
              type: 'folder',
              children: [
                { name: 'deep.md', path: '/level1/level2/deep.md', type: 'file' }
              ]
            },
            { name: 'file.md', path: '/level1/file.md', type: 'file' }
          ]
        }
      ];
      
      const paths = collectFilePaths(nodes);
      
      expect(paths).toEqual(['/level1/level2/deep.md', '/level1/file.md']);
    });

    it('should return empty array for empty input', () => {
      const paths = collectFilePaths([]);
      
      expect(paths).toEqual([]);
    });

    it('should return empty array when only folders exist', () => {
      const nodes: TreeNode[] = [
        { name: 'folder1', path: '/folder1', type: 'folder', children: [] },
        { name: 'folder2', path: '/folder2', type: 'folder' }
      ];
      
      const paths = collectFilePaths(nodes);
      
      expect(paths).toEqual([]);
    });

    it('should handle mixed empty and populated folders', () => {
      const nodes: TreeNode[] = [
        { name: 'empty', path: '/empty', type: 'folder', children: [] },
        {
          name: 'populated',
          path: '/populated',
          type: 'folder',
          children: [
            { name: 'file.md', path: '/populated/file.md', type: 'file' }
          ]
        }
      ];
      
      const paths = collectFilePaths(nodes);
      
      expect(paths).toEqual(['/populated/file.md']);
    });
  });
});
