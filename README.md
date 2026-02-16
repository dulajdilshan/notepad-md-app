# NotePad.md

A productivity-focused markdown note manager built with React and Express. Browse, edit, and manage markdown files from your local filesystem with a clean three-panel interface and built-in task tracking that syncs directly with your markdown checkboxes.

## Objectives

- **Local-first notes management** — Work directly with `.md` files on disk. No database, no cloud sync, no vendor lock-in. Your notes stay as plain markdown files in your filesystem.
- **Seamless editing experience** — Switch between a full-featured code editor (with syntax highlighting, line numbers, and markdown language support) and a rendered preview with a single click.
- **Todo extraction and sync** — Automatically extracts `- [ ]` and `- [x]` checkboxes from your markdown into a dedicated task panel. Toggling a task in the panel updates the markdown source and saves to disk — keeping everything in sync.
- **File organization** — Create new files and folders directly from the app. The sidebar mirrors your directory structure with collapsible folders and file selection.
- **Auto-save with manual override** — Changes are automatically saved after 1.5 seconds of inactivity. Use Ctrl/Cmd+S for immediate saves. An unsaved indicator keeps you informed.

## Architecture

### Overview

```
┌──────────────┬─────────────────────────────┬───────────────┐
│   Sidebar    │        Main Panel           │  Todo Panel   │
│   (w-72)     │        (flex-1)             │   (w-80)      │
│              │                             │               │
│  File Tree   │  EditorToolbar              │  "Tasks"      │
│  - Folders   │  ─────────────              │  Progress bar │
│  - .md files │  MarkdownEditor (edit mode) │  ☐ Todo 1     │
│              │       OR                    │  ☑ Todo 2     │
│  [+Folder]   │  MarkdownViewer (preview)   │  ☐ Todo 3     │
│  [+File]     │                             │               │
└──────────────┴─────────────────────────────┴───────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript, Vite |
| Styling | Tailwind CSS v4, `@tailwindcss/typography` |
| Markdown Editor | `@uiw/react-codemirror` + `@codemirror/lang-markdown` |
| Markdown Viewer | `react-markdown` + `remark-gfm` |
| Backend | Express.js (TypeScript, run with `tsx`) |
| Dev Tooling | `concurrently` (Vite + Express in parallel) |

### Project Structure

```
notepad-md-app/
├── index.html
├── package.json
├── vite.config.ts              # Tailwind plugin + /api proxy to port 3001
├── server/
│   ├── index.ts                # Express server (port 3001)
│   ├── routes/files.ts         # REST API endpoints with path sanitization
│   └── utils/fileTree.ts       # Recursive directory tree builder
└── src/
    ├── main.tsx
    ├── App.tsx                  # Root layout, global state
    ├── index.css                # Tailwind v4 imports
    ├── types/index.ts           # TreeNode, TodoItem interfaces
    ├── api/client.ts            # Fetch wrappers for all endpoints
    ├── hooks/
    │   ├── useFileTree.ts       # Fetch and manage file tree
    │   ├── useFileContent.ts    # Fetch/save file, dirty tracking, auto-save
    │   └── useTodos.ts          # Extract and toggle todos from content
    ├── components/
    │   ├── Sidebar.tsx          # Left panel: tree + create buttons
    │   ├── FileTree.tsx         # Recursive tree renderer
    │   ├── TreeNode.tsx         # Single folder/file node
    │   ├── MainPanel.tsx        # Center panel: toolbar + editor/viewer
    │   ├── EditorToolbar.tsx    # Filename, Edit/Preview toggle, Save button
    │   ├── MarkdownEditor.tsx   # CodeMirror wrapper
    │   ├── MarkdownViewer.tsx   # react-markdown renderer
    │   ├── TodoPanel.tsx        # Right panel: progress bar + todo list
    │   ├── TodoList.tsx         # List of todos
    │   ├── TodoItem.tsx         # Single checkbox + label
    │   └── CreateItemModal.tsx  # Modal for new file/folder name
    └── utils/
        └── todoParser.ts        # extractTodos() + toggleTodoInMarkdown()
```

### API Endpoints

All paths are relative to the notes root directory (the parent of `notepad-md-app/`).

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/tree` | Full directory tree (folders + `.md` files, excludes `notepad-md-app` and hidden files) |
| `GET` | `/api/file?path=X` | Read a markdown file's content |
| `PUT` | `/api/file` | Save/update file content `{ path, content }` |
| `POST` | `/api/file` | Create a new markdown file `{ path }` |
| `POST` | `/api/folder` | Create a new folder `{ path }` |

All endpoints validate paths through `sanitizePath()` to prevent directory traversal attacks.

### Todo Sync Flow

Todos are **derived state** — the markdown content string is the single source of truth.

```
Markdown content (state)
  │
  ├──► extractTodos(content)  ──► TodoPanel renders checkboxes
  │
  └──► MarkdownEditor displays raw text
          │
Toggle in TodoPanel
  │
  └──► toggleTodoInMarkdown(content, lineIndex)
          │
          ├──► setContent(updated)  ──► Editor + TodoPanel re-render
          └──► Debounced save to disk (1.5s)
```

- `extractTodos()` scans lines matching `- [ ] text` / `- [x] text`, skipping fenced code blocks
- `toggleTodoInMarkdown()` flips `[ ]` ↔ `[x]` on the target line
- Uses functional state updater (`setContent(prev => ...)`) for safe rapid toggles

## Getting Started

```bash
cd notepad-md-app
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. The app reads markdown files from the parent directory.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both Vite (port 5173) and Express (port 3001) |
| `npm run dev:client` | Start only the Vite frontend |
| `npm run dev:server` | Start only the Express backend |
| `npm run build` | Type-check and build for production |
