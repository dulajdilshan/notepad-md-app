import type { TreeNode } from '../types';
import type { FileSystemAdapter } from './interfaces';
import { serverAdapter } from './serverAdapter';
import { browserAdapter } from './browserAdapter';
import { localStorageAdapter } from './localStorageAdapter';

// Determine which adapter to use
// For now, we default to server, but if rootHandle is present in IDB (checked via browserAdapter.initialize)
// or if we strictly want browser mode, we switch.
// A simple way is to export a specific adapter based on state, but imports are static.
// We can use a proxy or singleton.

let currentAdapter: FileSystemAdapter = serverAdapter;

export const setAdapter = (type: 'server' | 'browser' | 'local-storage') => {
  if (type === 'browser') currentAdapter = browserAdapter;
  else if (type === 'local-storage') currentAdapter = localStorageAdapter;
  else currentAdapter = serverAdapter;

  localStorage.setItem('adapterType', type);
};

export const getAdapterType = () => {
  return localStorage.getItem('adapterType') as 'server' | 'browser' | 'local-storage' || 'server';
};

// Initialize
const savedType = getAdapterType();
if (savedType === 'browser') {
  currentAdapter = browserAdapter;
  // We don't await this here, handled by hooks
  browserAdapter.initialize();
} else if (savedType === 'local-storage') {
  currentAdapter = localStorageAdapter;
}

export async function checkBrowserSession() {
  return browserAdapter.checkSession();
}

export async function restoreBrowserSession() {
  return browserAdapter.restoreSession();
}

export async function fetchTree(): Promise<TreeNode[]> {
  return currentAdapter.fetchTree();
}

export async function fetchDirectories(path?: string): Promise<{ current: string; parent: string | null; directories: string[] }> {
  return currentAdapter.fetchDirectories(path);
}

export async function fetchFile(path: string): Promise<string> {
  return currentAdapter.readFile(path);
}

export async function saveFile(path: string, content: string): Promise<void> {
  return currentAdapter.saveFile(path, content);
}

export async function createFile(path: string): Promise<void> {
  return currentAdapter.createFile(path);
}

export async function createFolder(path: string): Promise<void> {
  return currentAdapter.createFolder(path);
}

export async function deleteFile(path: string): Promise<void> {
  return currentAdapter.deleteFile(path);
}

export async function deleteFolder(path: string): Promise<void> {
  return currentAdapter.deleteFolder(path);
}

