import type { TreeNode } from '../types';
import FileTree from './FileTree';
import appLogo from '../assets/notepad.md-logo.png';

interface Props {
  tree: TreeNode[];
  loading: boolean;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  onCreateFile: (path?: string) => void;
  onCreateFolder: (path?: string) => void;
  onDelete: (path: string, type: 'file' | 'folder') => void;
  onOpenSettings: () => void;
}

export default function Sidebar({ tree, loading, selectedPath, onSelectFile, onCreateFile, onCreateFolder, onDelete, onOpenSettings }: Props) {
  return (
    <div className="w-full bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col h-full backdrop-blur-xl shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300">
      <div className="px-5 py-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-10 supports-[backdrop-filter]:bg-white/40">
        <img src={appLogo} alt="NotePad.md" className="h-11 w-auto" />
        <div className="flex gap-1">
          <button
            onClick={() => onCreateFile()}
            className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-md transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title="New File"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
          <button
            onClick={() => onCreateFolder()}
            className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-md transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title="New Folder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          </button>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button
            onClick={onOpenSettings}
            className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-md transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            title="Settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pt-2 px-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
          </div>
        ) : (
          <FileTree
            tree={tree}
            selectedPath={selectedPath}
            onSelectFile={onSelectFile}
            onDelete={onDelete}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
          />
        )}
      </div>
    </div>
  );
}
