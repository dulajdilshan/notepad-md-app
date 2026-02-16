import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from './useTodos';

describe('useTodos', () => {
  it('should extract todos from content', () => {
    const content = `
# Tasks
- [ ] Task 1
- [x] Task 2
    `.trim();
    const setContent = vi.fn();

    const { result } = renderHook(() => useTodos(content, setContent));

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos[0]).toMatchObject({
      text: 'Task 1',
      checked: false,
      heading: 'Tasks'
    });
    expect(result.current.todos[1]).toMatchObject({
      text: 'Task 2',
      checked: true,
      heading: 'Tasks'
    });
  });

  it('should return empty array when no todos exist', () => {
    const content = '# Just a heading\nSome text';
    const setContent = vi.fn();

    const { result } = renderHook(() => useTodos(content, setContent));

    expect(result.current.todos).toEqual([]);
  });

  it('should update todos when content changes', () => {
    const setContent = vi.fn();
    const { result, rerender } = renderHook(
      ({ content }) => useTodos(content, setContent),
      { initialProps: { content: '- [ ] Task 1' } }
    );

    expect(result.current.todos).toHaveLength(1);

    rerender({ content: '- [ ] Task 1\n- [ ] Task 2' });

    expect(result.current.todos).toHaveLength(2);
  });

  it('should call setContent with toggle function when toggleTodo is called', () => {
    const content = '- [ ] Task 1';
    const setContent = vi.fn((updater) => {
      if (typeof updater === 'function') {
        return updater(content);
      }
      return updater;
    });

    const { result } = renderHook(() => useTodos(content, setContent));

    act(() => {
      result.current.toggleTodo(0);
    });

    expect(setContent).toHaveBeenCalled();
    expect(setContent).toHaveBeenCalledWith(expect.any(Function));

    // Verify the updater function works correctly
    const updater = setContent.mock.calls[0][0];
    const newContent = updater(content);
    expect(newContent).toBe('- [x] Task 1');
  });

  it('should toggle checked to unchecked', () => {
    const content = '- [x] Task 1';
    const setContent = vi.fn();

    const { result } = renderHook(() => useTodos(content, setContent));

    act(() => {
      result.current.toggleTodo(0);
    });

    const updater = setContent.mock.calls[0][0];
    const newContent = updater(content);
    expect(newContent).toBe('- [ ] Task 1');
  });

  it('should maintain stable toggleTodo reference when setContent does not change', () => {
    const setContent = vi.fn();
    const { result, rerender } = renderHook(() => useTodos('- [ ] Task', setContent));

    const firstToggleTodo = result.current.toggleTodo;

    rerender();

    expect(result.current.toggleTodo).toBe(firstToggleTodo);
  });

  it('should memoize todos when content does not change', () => {
    const setContent = vi.fn();
    const { result, rerender } = renderHook(() => useTodos('- [ ] Task', setContent));

    const firstTodos = result.current.todos;

    rerender();

    expect(result.current.todos).toBe(firstTodos);
  });

  it('should handle multiple todos with different headings', () => {
    const content = `
# Section 1
- [ ] Task 1

## Section 2
- [x] Task 2
- [ ] Task 3
    `.trim();
    const setContent = vi.fn();

    const { result } = renderHook(() => useTodos(content, setContent));

    expect(result.current.todos).toHaveLength(3);
    expect(result.current.todos[0].heading).toBe('Section 1');
    expect(result.current.todos[1].heading).toBe('Section 2');
    expect(result.current.todos[2].heading).toBe('Section 2');
  });

  it('should skip todos in code blocks', () => {
    const content = `
- [ ] Real task
\`\`\`
- [ ] Fake task
\`\`\`
- [ ] Another real task
    `.trim();
    const setContent = vi.fn();

    const { result } = renderHook(() => useTodos(content, setContent));

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos[0].text).toBe('Real task');
    expect(result.current.todos[1].text).toBe('Another real task');
  });
});
