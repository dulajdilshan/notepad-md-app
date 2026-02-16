import { describe, it, expect } from 'vitest';
import { extractTodos, toggleTodoInMarkdown } from './todoParser';

describe('todoParser', () => {
  describe('extractTodos', () => {
    it('should extract unchecked todos', () => {
      const markdown = `
# My Tasks
- [ ] Task 1
- [ ] Task 2
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(2);
      expect(todos[0]).toEqual({
        text: 'Task 1',
        checked: false,
        lineIndex: 1,
        heading: 'My Tasks'
      });
      expect(todos[1]).toEqual({
        text: 'Task 2',
        checked: false,
        lineIndex: 2,
        heading: 'My Tasks'
      });
    });

    it('should extract checked todos', () => {
      const markdown = `
- [x] Completed task
- [X] Another completed task
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(2);
      expect(todos[0].checked).toBe(true);
      expect(todos[0].text).toBe('Completed task');
      expect(todos[1].checked).toBe(true);
      expect(todos[1].text).toBe('Another completed task');
    });

    it('should extract mixed checked and unchecked todos', () => {
      const markdown = `
- [ ] Not done
- [x] Done
- [ ] Also not done
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(3);
      expect(todos[0].checked).toBe(false);
      expect(todos[1].checked).toBe(true);
      expect(todos[2].checked).toBe(false);
    });

    it('should track heading context', () => {
      const markdown = `
# Section 1
- [ ] Task in section 1

## Subsection
- [ ] Task in subsection

# Section 2
- [ ] Task in section 2
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(3);
      expect(todos[0].heading).toBe('Section 1');
      expect(todos[1].heading).toBe('Subsection');
      expect(todos[2].heading).toBe('Section 2');
    });

    it('should handle todos without heading', () => {
      const markdown = `
- [ ] Task before any heading
- [ ] Another task

# First Heading
- [ ] Task under heading
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(3);
      expect(todos[0].heading).toBeUndefined();
      expect(todos[1].heading).toBeUndefined();
      expect(todos[2].heading).toBe('First Heading');
    });

    it('should skip todos in code blocks', () => {
      const markdown = `
- [ ] Real task

\`\`\`
- [ ] This is in a code block
- [x] So is this
\`\`\`

- [ ] Another real task
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(2);
      expect(todos[0].text).toBe('Real task');
      expect(todos[1].text).toBe('Another real task');
    });

    it('should handle code blocks with language specifier', () => {
      const markdown = `
- [ ] Task 1

\`\`\`markdown
- [ ] Fake task in code block
\`\`\`

- [ ] Task 2
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(2);
      expect(todos[0].text).toBe('Task 1');
      expect(todos[1].text).toBe('Task 2');
    });

    it('should handle nested code blocks correctly', () => {
      const markdown = `
- [ ] Task 1
\`\`\`
First code block
- [ ] Not a task
\`\`\`
- [ ] Task 2
\`\`\`
Second code block
\`\`\`
- [ ] Task 3
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(3);
      expect(todos.map(t => t.text)).toEqual(['Task 1', 'Task 2', 'Task 3']);
    });

    it('should handle different list markers (* and -)', () => {
      const markdown = `
- [ ] Dash marker
* [ ] Star marker
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(2);
      expect(todos[0].text).toBe('Dash marker');
      expect(todos[1].text).toBe('Star marker');
    });

    it('should handle numbered lists', () => {
      const markdown = `
1. [ ] First numbered todo
2. [ ] Second numbered todo
3. [x] Third completed todo
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(3);
      expect(todos[0].text).toBe('First numbered todo');
      expect(todos[1].text).toBe('Second numbered todo');
      expect(todos[2].text).toBe('Third completed todo');
      expect(todos[2].checked).toBe(true);
    });

    it('should handle indented todos', () => {
      const markdown = `
- [ ] Parent task
  - [ ] Indented child task
    - [ ] Deeply indented task
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(3);
      expect(todos[0].text).toBe('Parent task');
      expect(todos[1].text).toBe('Indented child task');
      expect(todos[2].text).toBe('Deeply indented task');
    });

    it('should trim whitespace from todo text', () => {
      const markdown = `
- [ ]   Task with extra spaces   
- [ ] Normal task
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos[0].text).toBe('Task with extra spaces');
      expect(todos[1].text).toBe('Normal task');
    });

    it('should handle empty todo text', () => {
      const markdown = `
- [ ] 
- [ ] Real task
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(2);
      expect(todos[0].text).toBe('');
      expect(todos[1].text).toBe('Real task');
    });

    it('should handle empty markdown', () => {
      const todos = extractTodos('');
      expect(todos).toEqual([]);
    });

    it('should handle markdown with no todos', () => {
      const markdown = `
# Regular Markdown
Just some text
- Regular list item (not a todo)
      `.trim();

      const todos = extractTodos(markdown);
      expect(todos).toEqual([]);
    });

    it('should correctly track line indices', () => {
      const markdown = `Line 0
Line 1
- [ ] Task at line 2
Line 3
- [x] Task at line 4`;

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(2);
      expect(todos[0].lineIndex).toBe(2);
      expect(todos[1].lineIndex).toBe(4);
    });

    it('should handle todos with special characters', () => {
      const markdown = `
- [ ] Task with "quotes"
- [ ] Task with & symbols
- [x] Task with <html> tags
- [ ] Task with emoji 🎉
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(4);
      expect(todos[0].text).toBe('Task with "quotes"');
      expect(todos[1].text).toBe('Task with & symbols');
      expect(todos[2].text).toBe('Task with <html> tags');
      expect(todos[3].text).toBe('Task with emoji 🎉');
    });

    it('should handle todos with markdown formatting', () => {
      const markdown = `
- [ ] Task with **bold** text
- [ ] Task with *italic* text
- [x] Task with [link](https://example.com)
- [ ] Task with \`inline code\`
      `.trim();

      const todos = extractTodos(markdown);

      expect(todos).toHaveLength(4);
      expect(todos[0].text).toBe('Task with **bold** text');
      expect(todos[1].text).toBe('Task with *italic* text');
      expect(todos[2].text).toBe('Task with [link](https://example.com)');
      expect(todos[3].text).toBe('Task with `inline code`');
    });
  });

  describe('toggleTodoInMarkdown', () => {
    it('should toggle unchecked to checked', () => {
      const markdown = `
- [ ] Task 1
- [ ] Task 2
      `.trim();

      const result = toggleTodoInMarkdown(markdown, 0);

      expect(result).toBe(`
- [x] Task 1
- [ ] Task 2
      `.trim());
    });

    it('should toggle checked to unchecked', () => {
      const markdown = `
- [x] Task 1
- [ ] Task 2
      `.trim();

      const result = toggleTodoInMarkdown(markdown, 0);

      expect(result).toBe(`
- [ ] Task 1
- [ ] Task 2
      `.trim());
    });

    it('should toggle uppercase [X] to unchecked', () => {
      const markdown = '- [X] Task 1';
      const result = toggleTodoInMarkdown(markdown, 0);
      expect(result).toBe('- [ ] Task 1');
    });

    it('should preserve surrounding lines', () => {
      const markdown = `
# Header
Some text
- [ ] Task to toggle
More text
## Another header
      `.trim();

      const result = toggleTodoInMarkdown(markdown, 2);

      const lines = result.split('\n');
      expect(lines[0]).toBe('# Header');
      expect(lines[1]).toBe('Some text');
      expect(lines[2]).toBe('- [x] Task to toggle');
      expect(lines[3]).toBe('More text');
      expect(lines[4]).toBe('## Another header');
    });

    it('should handle invalid line index gracefully', () => {
      const markdown = '- [ ] Task 1';
      
      const resultTooLarge = toggleTodoInMarkdown(markdown, 999);
      expect(resultTooLarge).toBe(markdown);
      
      const resultNegative = toggleTodoInMarkdown(markdown, -1);
      expect(resultNegative).toBe(markdown);
    });

    it('should not modify non-todo lines', () => {
      const markdown = `
# Regular heading
Regular text line
- Regular list item
      `.trim();

      const result = toggleTodoInMarkdown(markdown, 1);
      expect(result).toBe(markdown);
    });

    it('should handle empty markdown', () => {
      const result = toggleTodoInMarkdown('', 0);
      expect(result).toBe('');
    });

    it('should toggle only the first checkbox on the line', () => {
      const markdown = '- [ ] Task with [ ] another checkbox in text';
      const result = toggleTodoInMarkdown(markdown, 0);
      expect(result).toBe('- [x] Task with [ ] another checkbox in text');
    });

    it('should preserve indentation', () => {
      const markdown = `
- [ ] Parent
  - [ ] Indented child
    - [ ] Deeply indented
      `.trim();

      const result = toggleTodoInMarkdown(markdown, 1);
      
      const lines = result.split('\n');
      expect(lines[1]).toBe('  - [x] Indented child');
    });

    it('should work with numbered lists', () => {
      const markdown = '1. [ ] Numbered todo';
      const result = toggleTodoInMarkdown(markdown, 0);
      expect(result).toBe('1. [x] Numbered todo');
    });

    it('should toggle todo with star marker', () => {
      const markdown = '* [ ] Task with star';
      const result = toggleTodoInMarkdown(markdown, 0);
      expect(result).toBe('* [x] Task with star');
    });

    it('should handle multiple toggles on same line', () => {
      let markdown = '- [ ] Task';
      
      markdown = toggleTodoInMarkdown(markdown, 0);
      expect(markdown).toBe('- [x] Task');
      
      markdown = toggleTodoInMarkdown(markdown, 0);
      expect(markdown).toBe('- [ ] Task');
      
      markdown = toggleTodoInMarkdown(markdown, 0);
      expect(markdown).toBe('- [x] Task');
    });

    it('should preserve line endings', () => {
      const markdown = '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3';
      const result = toggleTodoInMarkdown(markdown, 1);
      
      expect(result.split('\n')).toHaveLength(3);
      expect(result.split('\n')[1]).toBe('- [x] Task 2');
    });
  });
});
