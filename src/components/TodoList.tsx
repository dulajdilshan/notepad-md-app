import type { TodoItem as TodoItemType } from '../types';
import TodoItem from './TodoItem';

interface Props {
  todos: TodoItemType[];
  onToggle: (lineIndex: number) => void;
}

export default function TodoList({ todos, onToggle }: Props) {
  if (todos.length === 0) {
    return <p className="text-sm text-slate-400 dark:text-slate-600 px-3 py-2">No todos found in this file</p>;
  }

  const groupedTodos = todos.reduce((acc, todo) => {
    const heading = todo.heading || 'General';
    if (!acc[heading]) {
      acc[heading] = [];
    }
    acc[heading].push(todo);
    return acc;
  }, {} as Record<string, TodoItemType[]>);

  // Preserve order of headings based on first appearance in list?
  // Or just iterate standard object keys? Object keys order is insertion order usually in modern JS for strings.
  // Better to use dedicated array to preserve order if needed, but for now simple iteration is likely fine
  // as the reduce will create keys in order of encountering them.

  return (
    <div className="space-y-4">
      {Object.entries(groupedTodos).map(([heading, items]) => (
        <div key={heading}>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1 sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-1 z-10">
            {heading}
          </h3>
          <div className="space-y-0.5">
            {items.map((todo) => (
              <TodoItem key={todo.lineIndex} todo={todo} onToggle={onToggle} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
