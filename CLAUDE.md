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
- `localStorageAdapter.ts` — IndexedDB virtual filesystem, keys: `vfs:root` (tree), `vfs:content:{path}` (files), `vfs:version`
- `client.ts` — Adapter switcher that selects implementation based on `localStorage.adapterType`

All file operations (CRUD, tree fetching, export) go through the adapter interface.

### State Management

No external state library. Uses:
- `SettingsContext` (`src/contexts/SettingsContext.tsx`) — global theme, rootPath (storage mode), refreshKey for tree reloads
- `rootPath` values: `'BROWSER_NATIVE'`, `'BROWSER_STORAGE'`, or `''` (uninitialized → shows WelcomeModal)
- App-level state in `src/App.tsx` for selected file, content, view mode, modals

### Custom Hooks (src/hooks/)

- `useFileTree` — fetches tree, handles browser permission lifecycle
- `useFileContent` — loads/saves files with 1500ms debounced auto-save and Ctrl+S manual save
- `useTodos` — extracts `- [ ]`/`- [x]` items from markdown, toggles them by line index
- `useDataManagement` — export/import JSON with semver version validation, clear storage
- `useKeyboardShortcuts` — global ESC handler for closing modals/sidebars

### Layout

Three-column desktop layout: Sidebar (file tree) | MainPanel (editor/preview) | TodoPanel (tasks). On mobile, Sidebar and TodoPanel become fixed off-canvas drawers with backdrop overlays.

### UI Component Pattern

Base `Button` component (`src/components/ui/Button.tsx`) with variants (primary/secondary/danger/ghost/outline). Specialized wrappers: `PrimaryButton`, `SecondaryButton`, `DangerButton`, `OutlineButton`.

Dark mode uses Tailwind class-based strategy configured in `src/index.css`.

### Version Compatibility

`src/config/supportedVersions.ts` defines import-compatible versions. `src/utils/versionValidator.ts` supports exact match, `^` (minor range), and `^^` (major range) patterns.
