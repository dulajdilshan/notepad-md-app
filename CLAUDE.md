# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NotePad.md is a privacy-focused, 100% client-side markdown note manager built as a React SPA. It supports two storage modes:
- **Browser Native**: File System Access API for direct `.md` file editing (Chrome/Edge/Opera only)
- **In-Browser Storage**: IndexedDB-based sandbox (all browsers)

## Build & Development Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test framework is configured.

## Tech Stack

- React 19 + TypeScript (ES2022 target, strict mode)
- Vite with Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- CodeMirror (`@uiw/react-codemirror`) for editing, `react-markdown` + `remark-gfm` for preview
- `idb-keyval` for IndexedDB access
- Base path: `/notepad-md-app/` (configured in vite.config.ts)

## Architecture

### Storage Abstraction (Ports & Adapters)

The core architectural pattern is a `FileSystemAdapter` interface (`src/api/interfaces.ts`) with two implementations:
- `browserAdapter.ts` — File System Access API, stores directory handle in IndexedDB
- `localStorageAdapter.ts` — IndexedDB virtual filesystem, uses constants from `src/constants.ts` (`STORAGE_KEYS.ROOT`, `STORAGE_KEYS.CONTENT_PREFIX`, `STORAGE_KEYS.VERSION`)
- `client.ts` — Adapter switcher that selects implementation based on `localStorage.adapterType`
- `index.ts` — Barrel export re-exporting all public functions from `client.ts`

All file operations (CRUD, tree fetching, export) go through the adapter interface. Shared recursive tree traversal helpers (`addNodeToTree`, `removeNodeFromTree`, `findAndRemoveNode`, `collectFilePaths`) live in `src/utils/treeUtils.ts`.

### Constants (`src/constants.ts`)

Centralized magic strings and config values used across the codebase:
- `ADAPTER_TYPE` — `{ BROWSER: 'BROWSER_NATIVE', STORAGE: 'BROWSER_STORAGE' }`
- `STORAGE_KEYS` — IndexedDB key prefixes (`vfs:root`, `vfs:content:`, `vfs:version`)
- `LOCAL_STORAGE_KEYS` — localStorage keys (`rootPath`, `theme`, `adapterType`)
- `AUTO_SAVE_DELAY` (1500ms), `SAVE_INDICATOR_DELAY` (500ms)

### State Management

No external state library. Uses:
- `SettingsContext` (`src/contexts/SettingsContext.tsx`) — global theme, rootPath (storage mode), refreshKey for tree reloads
- `rootPath` values: `ADAPTER_TYPE.BROWSER`, `ADAPTER_TYPE.STORAGE`, or `''` (uninitialized → shows WelcomeModal)
- App-level state in `src/App.tsx` for selected file, content, view mode, modals

### Shared Types (`src/types/index.ts`)

- `TreeNode`, `TodoItem` — core data models
- `ViewMode` (`'edit' | 'preview'`), `ItemType` (`'file' | 'folder'`) — union types
- `CreateItemModal`, `ConfirmationState` — UI state interfaces used in `App.tsx` and hooks

### Custom Hooks (`src/hooks/`)

- `useFileTree` — fetches tree, handles browser permission lifecycle
- `useFileContent` — loads/saves files with debounced auto-save (`AUTO_SAVE_DELAY`) and Ctrl+S manual save
- `useTodos` — extracts `- [ ]`/`- [x]` items from markdown, toggles them by line index
- `useDataManagement` — export/import JSON with semver version validation, clear storage
- `useKeyboardShortcuts` — global ESC handler for closing modals/sidebars (typed with `CreateItemModal`)

All hooks are re-exported from `src/hooks/index.ts`.

### Component Organization (`src/components/`)

Components are organized into logical subfolders:

```
components/
├── layout/          # Page structure: Sidebar, MainPanel, EditorToolbar, MobileHeader
├── editor/          # MarkdownEditor (CodeMirror), MarkdownViewer (react-markdown)
├── tree/            # FileTree, FileTreeNode (recursive node renderer)
├── todos/           # TodoPanel, TodoList, TodoCheckbox
├── modals/          # CreateItemModal, ConfirmationModal, WelcomeModal, SettingsModal, RestoreSessionModal, FolderPicker
├── settings/        # FileSystemSection, DataManagementSection, DangerZone
└── ui/              # Button (base), PrimaryButton, SecondaryButton, OutlineButton, DangerButton, ThemeToggle, FeatureWarning
```

**Naming conventions**: Component files match their default export name. The `tree/FileTreeNode.tsx` component is `FileTreeNode` (not `TreeNode`) to avoid collision with the `TreeNode` type. Similarly, `todos/TodoCheckbox.tsx` is `TodoCheckbox` (not `TodoItem`) to avoid collision with the `TodoItem` type.

### UI Component Pattern

Base `Button` component (`src/components/ui/Button.tsx`) with variants (primary/secondary/danger/ghost/outline). Specialized wrappers: `PrimaryButton`, `SecondaryButton`, `DangerButton`, `OutlineButton`. All re-exported from `src/components/ui/index.ts`.

Dark mode uses Tailwind class-based strategy configured in `src/index.css`.

### Layout

Three-column desktop layout: Sidebar (file tree) | MainPanel (editor/preview) | TodoPanel (tasks). On mobile, Sidebar and TodoPanel become fixed off-canvas drawers with backdrop overlays.

### Version Compatibility

`src/config/supportedVersions.ts` defines import-compatible versions. `src/utils/versionValidator.ts` supports exact match, `^` (minor range), and `^^` (major range) patterns.

### Barrel Exports

The following directories provide `index.ts` barrel files for cleaner imports:
- `src/api/` — re-exports from `client.ts`
- `src/hooks/` — re-exports all hooks
- `src/contexts/` — re-exports `SettingsProvider` and `useSettings`
- `src/components/ui/` — re-exports all UI components
- `src/types/` — all shared types
