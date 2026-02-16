import type { TreeNode as TreeNodeType } from '../types';
import TreeNode from './TreeNode';

interface Props {
  tree: TreeNodeType[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  onDelete: (path: string, type: 'file' | 'folder') => void;
  onCreateFile: (path: string) => void;
  onCreateFolder: (path: string) => void;
}

export default function FileTree({ tree, selectedPath, onSelectFile, onDelete, onCreateFile, onCreateFolder }: Props) {
  if (tree.length === 0) {
    return <p className="text-sm text-slate-400 dark:text-slate-600 px-3 py-2">No markdown files found</p>;
  }

  return (
    <div className="py-1">
      {tree.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
          onDelete={onDelete}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
        />
      ))}
    </div>
  );
}
