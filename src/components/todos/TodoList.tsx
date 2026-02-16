import type { TodoItem } from '../../types';
import TodoCheckbox from './TodoCheckbox';

interface Props {
  todos: TodoItem[];
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
  }, {} as Record<string, TodoItem[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedTodos).map(([heading, items]) => (
        <div key={heading}>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1 sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm py-1 z-10">
            {heading}
          </h3>
          <div className="space-y-0.5">
            {items.map((todo) => (
              <TodoCheckbox key={todo.lineIndex} todo={todo} onToggle={onToggle} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
