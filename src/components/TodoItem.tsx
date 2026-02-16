import type { TodoItem as TodoItemType } from '../types';

interface Props {
  todo: TodoItemType;
  onToggle: (lineIndex: number) => void;
}

export default function TodoItem({ todo, onToggle }: Props) {
  return (
    <label className={`flex items-start gap-3 px-3 py-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group ${todo.checked ? 'opacity-60' : ''}`}>
      <div className="relative flex items-center mt-0.5">
        <input
          type="checkbox"
          checked={todo.checked}
          onChange={() => onToggle(todo.lineIndex)}
          className="peer appearance-none w-4 h-4 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-colors cursor-pointer"
        />
        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5 top-0.5 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
      </div>
      <span className={`text-sm leading-relaxed transition-colors duration-200 ${todo.checked ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
        {todo.text}
      </span>
    </label>
  );
}
