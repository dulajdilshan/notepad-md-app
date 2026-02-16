import type { TodoItem } from '../types';

export function extractTodos(markdown: string): TodoItem[] {
  const lines = markdown.split('\n');
  const todos: TodoItem[] = [];
  let inCodeBlock = false;

  let currentHeading: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    // Check for headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      currentHeading = headingMatch[2].trim();
      continue;
    }

    // Match todo items
    const unchecked = line.match(/^(\s*)([-*]|\d+\.)\s\[ \]\s?(.*)$/);
    if (unchecked) {
      todos.push({
        text: unchecked[3].trim(),
        checked: false,
        lineIndex: i,
        heading: currentHeading
      });
      continue;
    }

    const checked = line.match(/^(\s*)([-*]|\d+\.)\s\[x\]\s?(.*)$/i);
    if (checked) {
      todos.push({
        text: checked[3].trim(),
        checked: true,
        lineIndex: i,
        heading: currentHeading
      });
    }
  }

  return todos;
}

export function toggleTodoInMarkdown(markdown: string, lineIndex: number): string {
  const lines = markdown.split('\n');
  const line = lines[lineIndex];
  if (!line) return markdown;

  if (line.match(/\[ \]/)) {
    lines[lineIndex] = line.replace(/\[ \]/, '[x]');
  } else if (line.match(/\[x\]/i)) {
    lines[lineIndex] = line.replace(/\[x\]/i, '[ ]');
  }

  return lines.join('\n');
}
