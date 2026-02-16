import { useState } from 'react';
import type { TreeNode } from '../../types';

interface Props {
  node: TreeNode;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  onDelete: (path: string, type: 'file' | 'folder') => void;
  onCreateFile: (path: string) => void;
  onCreateFolder: (path: string) => void;
  depth?: number;
}

export default function FileTreeNode({ node, selectedPath, onSelectFile, onDelete, onCreateFile, onCreateFolder, depth = 0 }: Props) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = node.path === selectedPath;

  if (node.type === 'folder') {
    return (
      <div className="relative">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`group/node flex items-center justify-between gap-1 w-full text-left px-2 py-1 text-sm rounded ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <div className="flex items-center gap-1 flex-1 truncate">
            <span className="text-xs text-slate-400 dark:text-slate-500">{expanded ? '▼' : '▶'}</span>
            <span className="text-yellow-500 dark:text-yellow-400">📁</span>
            <span className="truncate">{node.name}</span>
          </div>

          <div className="hidden group-hover/node:flex items-center gap-1">
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onCreateFile(node.path);
              }}
              className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
              title="New File inside"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </span>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder(node.path);
              }}
              className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
              title="New Folder inside"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </span>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.path, 'folder');
              }}
              className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete folder"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </span>
          </div>
        </button>

        {expanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
                onDelete={onDelete}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group/node flex items-center justify-between gap-1 w-full text-left px-2 py-1.5 text-sm rounded-r-md transition-colors relative
        ${isSelected
          ? 'bg-blue-50/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
          : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
        }`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-r shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
      )}
      <button
        onClick={() => onSelectFile(node.path)}
        className="flex items-center gap-2 flex-1 truncate"
      >
        <span className="text-slate-400 dark:text-slate-500">📄</span>
        <span className={`truncate ${isSelected ? 'font-medium' : ''}`}>{node.name}</span>
      </button>

      <div className={`hidden group-hover/node:flex items-center gap-1 ${isSelected ? 'flex' : ''}`}>
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            // App.tsx handles confirmation, but better to do it here for consistency if we wanted
            onDelete(node.path, 'file');
          }}
          className={`p-1 rounded transition-colors ${isSelected ? 'text-blue-400 hover:text-red-500 hover:bg-blue-100 dark:hover:bg-blue-900/50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:text-slate-500 dark:hover:bg-red-900/20'}`}
          title="Delete file"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </span>
      </div>
    </div>
  );
}
