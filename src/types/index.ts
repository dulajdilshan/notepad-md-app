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
