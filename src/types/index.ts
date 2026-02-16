export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
}

export interface TodoItem {
  text: string;
  checked: boolean;
  lineIndex: number;
  heading?: string;
}

export type ViewMode = 'edit' | 'preview';

export type ItemType = 'file' | 'folder';

export interface CreateItemModal {
  type: ItemType;
  basePath?: string;
}

export interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}
