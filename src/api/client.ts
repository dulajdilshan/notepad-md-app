import type { TreeNode } from '../types';
import type { FileSystemAdapter } from './interfaces';
import { browserAdapter } from './browserAdapter';
import { localStorageAdapter } from './localStorageAdapter';
import { LOCAL_STORAGE_KEYS } from '../constants';

// Determine which adapter to use
let currentAdapter: FileSystemAdapter = localStorageAdapter;

export const setAdapter = (type: 'browser' | 'local-storage') => {
  if (type === 'browser') currentAdapter = browserAdapter;
  else currentAdapter = localStorageAdapter;

  localStorage.setItem(LOCAL_STORAGE_KEYS.ADAPTER_TYPE, type);
};

export const getAdapterType = () => {
  return localStorage.getItem(LOCAL_STORAGE_KEYS.ADAPTER_TYPE) as 'browser' | 'local-storage' || 'local-storage';
};

// Initialize
const savedType = getAdapterType();
if (savedType === 'browser') {
  currentAdapter = browserAdapter;
  // We don't await this here, handled by hooks
  browserAdapter.initialize();
} else {
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

export async function exportData(): Promise<{ [key: string]: string | object }> {
  return currentAdapter.exportData();
}

