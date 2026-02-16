# Testing Documentation

## Overview

This document describes the comprehensive unit test suite for NotePad.md. The test suite covers utility functions, storage adapters, custom hooks, and UI components.

## Test Framework

- **Framework**: Vitest 4.0.18
- **Testing Library**: @testing-library/react 16.3.2
- **User Events**: @testing-library/user-event 14.6.1
- **Assertions**: @testing-library/jest-dom 6.9.1
- **Environment**: jsdom 25.0.0
- **IndexedDB Mocking**: fake-indexeddb 6.2.5

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with UI
npm test:ui

# Run tests with coverage (requires @vitest/coverage-v8)
npm test:coverage
```

## Test Coverage Summary

### Total Statistics
- **Test Files**: 9
- **Total Tests**: 194
- **All Passing**: ✓

### Breakdown by Category

#### 1. Utility Functions (79 tests)

**src/utils/treeUtils.test.ts** (22 tests)
- `addNodeToTree()`: 7 tests
  - Adding nodes to root and nested folders
  - Duplicate detection
  - Children array initialization
  - Deep nesting support
- `removeNodeFromTree()`: 5 tests
  - Removing from root and nested locations
  - Folder removal with children
  - Non-existent node handling
- `findAndRemoveNode()`: 4 tests
  - Finding and removing nodes
  - Returning removed node data
- `collectFilePaths()`: 6 tests
  - Flat and nested structures
  - Deep nesting
  - Empty trees and folder-only trees

**src/utils/versionValidator.test.ts** (26 tests)
- `isVersionSupported()`: 26 tests
  - Exact version matching
  - Caret (^) pattern for patch updates (0.2.x)
  - Double caret (^^) pattern for minor/patch updates (1.x.x)
  - Multiple pattern support
  - Edge cases (empty strings, malformed versions)
  - Real-world scenarios

**src/utils/todoParser.test.ts** (31 tests)
- `extractTodos()`: 21 tests
  - Checked and unchecked todos
  - Heading context tracking
  - Code block detection and skipping
  - Different list markers (-, *, numbered)
  - Indentation handling
  - Special characters and markdown formatting
  - Line index tracking
- `toggleTodoInMarkdown()`: 10 tests
  - Toggling checked/unchecked states
  - Preserving surrounding lines
  - Invalid index handling
  - Multiple toggles

#### 2. Storage Adapters (54 tests)

**src/api/localStorageAdapter.test.ts** (48 tests)
- `fetchTree()`: 3 tests - Initialization with default tree
- `fetchDirectories()`: 2 tests - Mock directory structure
- `readFile()`: 3 tests - Reading content, error handling
- `saveFile()`: 3 tests - Saving and overwriting content
- `createFile()`: 6 tests - File creation, .md extension handling, nested files
- `createFolder()`: 3 tests - Folder creation at root and nested
- `deleteFile()`: 4 tests - File deletion from tree and IndexedDB
- `deleteFolder()`: 4 tests - Folder deletion with cascading file removal
- `exportData()`: 5 tests - Flat and nested export, deep structures
- `importData()`: 5 tests - Flat and nested import, clearing existing data
- `getNoteCount()`: 3 tests - Counting content keys
- `getVersion()` / `setVersion()`: 3 tests - Version management
- `clearStorage()`: 3 tests - Clearing app-related keys

**src/api/client.test.ts** (6 tests)
- `setAdapter()`: 3 tests - Switching between browser and local-storage
- `getAdapterType()`: 3 tests - Retrieving adapter type, default behavior

#### 3. Custom Hooks (23 tests)

**src/hooks/useTodos.test.ts** (9 tests)
- Todo extraction from content
- Empty array for no todos
- Content change reactivity
- Toggle functionality
- Memoization behavior
- Multiple headings
- Code block filtering

**src/hooks/useKeyboardShortcuts.test.ts** (14 tests)
- ESC key handling with priority:
  1. Modal closure
  2. Settings closure
  3. Mobile sidebar closure
  4. Mobile todo panel closure
  5. File closure
- Priority chain testing
- Event listener cleanup
- Re-registration on dependency changes

#### 4. UI Components (38 tests)

**src/components/ui/Button.test.tsx** (20 tests)
- Rendering with children
- Variant styles (primary, secondary, danger, ghost, outline)
- Size options (sm, md, lg)
- Icon rendering
- Custom className support
- Click event handling
- Disabled state
- HTML attributes pass-through
- Focus and transition styles

**src/components/todos/TodoCheckbox.test.tsx** (18 tests)
- Todo text rendering
- Checked/unchecked states
- Toggle functionality on checkbox and label click
- Line-through styling for completed todos
- Opacity reduction for completed todos
- Custom checkbox styling
- Line index handling
- Empty and special character text
- Hover styles
- SVG checkmark rendering
- Accessibility
- Multiple toggles
- Transition classes

## Test Architecture

### Directory Structure

```
src/
├── utils/
│   ├── treeUtils.ts
│   ├── treeUtils.test.ts
│   ├── versionValidator.ts
│   ├── versionValidator.test.ts
│   ├── todoParser.ts
│   └── todoParser.test.ts
├── api/
│   ├── localStorageAdapter.ts
│   ├── localStorageAdapter.test.ts
│   ├── client.ts
│   └── client.test.ts
├── hooks/
│   ├── useTodos.ts
│   ├── useTodos.test.ts
│   ├── useKeyboardShortcuts.ts
│   └── useKeyboardShortcuts.test.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   └── todos/
│       ├── TodoCheckbox.tsx
│       └── TodoCheckbox.test.tsx
└── test/
    └── setup.ts
```

### Test Setup (src/test/setup.ts)

The setup file configures:
- `@testing-library/jest-dom` matchers
- Automatic cleanup after each test
- localStorage mock
- matchMedia mock
- File System Access API mock
- fake-indexeddb import

### Configuration (vitest.config.ts)

- **Environment**: jsdom (for DOM testing)
- **Pool**: threads (for parallel execution)
- **Globals**: true (describe, it, expect available globally)
- **Setup Files**: ./src/test/setup.ts

## Testing Patterns

### 1. Pure Functions (Utils)
```typescript
// Direct testing without mocks
it('should add node to tree', () => {
  const nodes = [];
  const newNode = { name: 'test.md', path: 'test.md', type: 'file' };
  const result = addNodeToTree(nodes, '', newNode);
  expect(result).toBe(true);
  expect(nodes).toHaveLength(1);
});
```

### 2. Storage Adapters
```typescript
// Using fake-indexeddb for IndexedDB operations
beforeEach(async () => {
  await clear(); // Clear IndexedDB before each test
});

it('should save file content', async () => {
  await localStorageAdapter.saveFile('test.md', 'Content');
  const saved = await get(`${STORAGE_KEYS.CONTENT_PREFIX}test.md`);
  expect(saved).toBe('Content');
});
```

### 3. React Hooks
```typescript
// Using renderHook from @testing-library/react
it('should extract todos from content', () => {
  const setContent = vi.fn();
  const { result } = renderHook(() => useTodos(content, setContent));
  expect(result.current.todos).toHaveLength(2);
});
```

### 4. React Components
```typescript
// Using render and screen from @testing-library/react
it('should render button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
});

// User interactions with userEvent
it('should handle click', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Click</Button>);
  await user.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalled();
});
```

## Areas Not Covered (Future Work)

### High Priority
1. **browserAdapter.ts** - File System Access API adapter (requires complex mocking)
2. **useFileContent.ts** - File loading, saving, auto-save, debouncing
3. **useFileTree.ts** - Tree fetching, permission handling
4. **useDataManagement.ts** - Export/import flows, version validation

### Medium Priority
5. **Complex Components**:
   - FileTree / FileTreeNode (recursive rendering)
   - MarkdownEditor / MarkdownViewer
   - Modal components
6. **Integration Tests**: Testing component interactions

### Lower Priority
7. **Layout Components**: Sidebar, MainPanel, TodoPanel
8. **Settings Components**: FileSystemSection, DataManagementSection
9. **Context**: SettingsContext provider and consumer

## Best Practices

1. **Isolation**: Each test is independent and can run in any order
2. **Cleanup**: Automatic cleanup after each test via setup file
3. **Mocking**: Use vi.fn() for function mocks, fake-indexeddb for storage
4. **Naming**: Descriptive test names starting with "should"
5. **Arrangement**: Follow AAA pattern (Arrange, Act, Assert)
6. **User-Centric**: Use @testing-library queries (getByRole, getByText)
7. **Async**: Properly await async operations and user events

## Common Testing Utilities

### Vitest Matchers
- `expect(value).toBe(expected)` - Strict equality
- `expect(value).toEqual(expected)` - Deep equality
- `expect(value).toContain(item)` - Array/string contains
- `expect(value).toHaveLength(n)` - Array/string length
- `expect(fn).toHaveBeenCalled()` - Function was called
- `expect(fn).toHaveBeenCalledWith(args)` - Function called with args

### @testing-library/jest-dom Matchers
- `expect(element).toBeInTheDocument()` - Element exists
- `expect(element).toBeVisible()` - Element is visible
- `expect(element).toBeDisabled()` - Element is disabled
- `expect(element).toHaveAttribute(name, value)` - Has attribute
- `expect(element).toHaveClass(className)` - Has CSS class
- `expect(checkbox).toBeChecked()` - Checkbox is checked

## Continuous Integration

Tests are designed to run in CI/CD pipelines:
- No external dependencies (except npm packages)
- Deterministic results
- Fast execution (< 1 second total)
- No flaky tests

## Maintenance

### Adding New Tests
1. Create `.test.ts` or `.test.tsx` file next to source file
2. Follow existing patterns for similar test types
3. Run tests to ensure they pass
4. Consider edge cases and error conditions

### Updating Tests
- Update tests when implementation changes
- Keep tests focused and minimal
- Refactor common test setup into helper functions
- Use beforeEach for shared setup

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
