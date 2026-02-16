import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoCheckbox from './TodoCheckbox';
import type { TodoItem } from '../../types';

describe('TodoCheckbox', () => {
  const createTodo = (overrides: Partial<TodoItem> = {}): TodoItem => ({
    text: 'Test task',
    checked: false,
    lineIndex: 0,
    heading: undefined,
    ...overrides,
  });

  it('should render todo text', () => {
    const todo = createTodo({ text: 'My test task' });
    render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    expect(screen.getByText('My test task')).toBeInTheDocument();
  });

  it('should render unchecked checkbox for unchecked todo', () => {
    const todo = createTodo({ checked: false });
    render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox for checked todo', () => {
    const todo = createTodo({ checked: true });
    render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle with lineIndex when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const todo = createTodo({ lineIndex: 5 });
    
    render(<TodoCheckbox todo={todo} onToggle={onToggle} />);
    
    await user.click(screen.getByRole('checkbox'));
    
    expect(onToggle).toHaveBeenCalledWith(5);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onToggle when label is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const todo = createTodo({ text: 'Click anywhere', lineIndex: 3 });
    
    render(<TodoCheckbox todo={todo} onToggle={onToggle} />);
    
    await user.click(screen.getByText('Click anywhere'));
    
    expect(onToggle).toHaveBeenCalledWith(3);
  });

  it('should apply line-through style to checked todo text', () => {
    const todo = createTodo({ checked: true, text: 'Completed task' });
    render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    const text = screen.getByText('Completed task');
    expect(text.className).toContain('line-through');
  });

  it('should not apply line-through style to unchecked todo text', () => {
    const todo = createTodo({ checked: false, text: 'Incomplete task' });
    render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    const text = screen.getByText('Incomplete task');
    expect(text.className).not.toContain('line-through');
  });

  it('should apply reduced opacity to completed todos', () => {
    const todo = createTodo({ checked: true });
    const { container } = render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    const label = container.querySelector('label');
    expect(label?.className).toContain('opacity-60');
  });

  it('should not apply reduced opacity to unchecked todos', () => {
    const todo = createTodo({ checked: false });
    const { container } = render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    const label = container.querySelector('label');
    expect(label?.className).not.toContain('opacity-60');
  });

  it('should render checkbox with custom styling', () => {
    const todo = createTodo();
    render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.className).toContain('appearance-none');
    expect(checkbox.className).toContain('rounded');
  });

  it('should handle todos with different line indices', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(
      <TodoCheckbox todo={createTodo({ lineIndex: 10 })} onToggle={onToggle} />
    );
    
    await user.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(10);
    
    rerender(
      <TodoCheckbox todo={createTodo({ lineIndex: 25 })} onToggle={onToggle} />
    );
    
    await user.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenLastCalledWith(25);
  });

  it('should handle empty todo text', () => {
    const todo = createTodo({ text: '' });
    render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    // Should render without crashing
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should handle special characters in todo text', () => {
    const todo = createTodo({ text: 'Task with "quotes" & <html>' });
    render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    expect(screen.getByText('Task with "quotes" & <html>')).toBeInTheDocument();
  });

  it('should have hover styles', () => {
    const todo = createTodo();
    const { container } = render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    const label = container.querySelector('label');
    expect(label?.className).toContain('hover:bg-white');
    expect(label?.className).toContain('dark:hover:bg-slate-800');
  });

  it('should render SVG checkmark', () => {
    const todo = createTodo({ checked: true });
    const { container } = render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // SVG elements use getAttribute for class
    const svgClass = svg?.getAttribute('class');
    expect(svgClass).toContain('peer-checked:opacity-100');
  });

  it('should be accessible', () => {
    const todo = createTodo({ text: 'Accessible task' });
    render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    
    // Label is properly associated
    const label = checkbox.closest('label');
    expect(label).toBeInTheDocument();
    expect(label).toContainElement(checkbox);
  });

  it('should not prevent multiple toggles', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const todo = createTodo({ lineIndex: 1 });
    
    render(<TodoCheckbox todo={todo} onToggle={onToggle} />);
    
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('checkbox'));
    
    expect(onToggle).toHaveBeenCalledTimes(3);
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('should apply transition classes', () => {
    const todo = createTodo();
    const { container } = render(<TodoCheckbox todo={todo} onToggle={vi.fn()} />);
    
    const label = container.querySelector('label');
    expect(label?.className).toContain('transition-all');
    
    const text = container.querySelector('span:last-child');
    expect(text?.className).toContain('transition-colors');
  });
});
