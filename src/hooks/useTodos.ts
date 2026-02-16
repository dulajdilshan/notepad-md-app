import { useMemo, useCallback } from 'react';
import type { TodoItem } from '../types';
import { extractTodos, toggleTodoInMarkdown } from '../utils/todoParser';

export function useTodos(content: string, setContent: (updater: (prev: string) => string) => void) {
  const todos: TodoItem[] = useMemo(() => extractTodos(content), [content]);

  const toggleTodo = useCallback(
    (lineIndex: number) => {
      setContent((prev) => toggleTodoInMarkdown(prev, lineIndex));
    },
    [setContent]
  );

  return { todos, toggleTodo };
}
