import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  const createParams = (overrides = {}) => ({
    modal: null,
    isSettingsOpen: false,
    isMobileSidebarOpen: false,
    isMobileTodoOpen: false,
    selectedPath: null,
    setModal: vi.fn(),
    setIsSettingsOpen: vi.fn(),
    setIsMobileSidebarOpen: vi.fn(),
    setIsMobileTodoOpen: vi.fn(),
    handleCloseFile: vi.fn(),
    ...overrides,
  });

  const pressEscape = () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(event);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should close modal when ESC is pressed and modal is open', () => {
    const setModal = vi.fn();
    const params = createParams({
      modal: { type: 'file' as const },
      setModal,
    });

    renderHook(() => useKeyboardShortcuts(params));

    pressEscape();

    expect(setModal).toHaveBeenCalledWith(null);
    expect(setModal).toHaveBeenCalledTimes(1);
  });

  it('should close settings when ESC is pressed and settings are open', () => {
    const setIsSettingsOpen = vi.fn();
    const params = createParams({
      modal: null,
      isSettingsOpen: true,
      setIsSettingsOpen,
    });

    renderHook(() => useKeyboardShortcuts(params));

    pressEscape();

    expect(setIsSettingsOpen).toHaveBeenCalledWith(false);
  });

  it('should close mobile sidebar when ESC is pressed and sidebar is open', () => {
    const setIsMobileSidebarOpen = vi.fn();
    const params = createParams({
      modal: null,
      isSettingsOpen: false,
      isMobileSidebarOpen: true,
      setIsMobileSidebarOpen,
    });

    renderHook(() => useKeyboardShortcuts(params));

    pressEscape();

    expect(setIsMobileSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('should close mobile todo panel when ESC is pressed and todo panel is open', () => {
    const setIsMobileTodoOpen = vi.fn();
    const params = createParams({
      modal: null,
      isSettingsOpen: false,
      isMobileSidebarOpen: false,
      isMobileTodoOpen: true,
      setIsMobileTodoOpen,
    });

    renderHook(() => useKeyboardShortcuts(params));

    pressEscape();

    expect(setIsMobileTodoOpen).toHaveBeenCalledWith(false);
  });

  it('should close file when ESC is pressed and file is selected', () => {
    const handleCloseFile = vi.fn();
    const params = createParams({
      modal: null,
      isSettingsOpen: false,
      isMobileSidebarOpen: false,
      isMobileTodoOpen: false,
      selectedPath: 'file.md',
      handleCloseFile,
    });

    renderHook(() => useKeyboardShortcuts(params));

    pressEscape();

    expect(handleCloseFile).toHaveBeenCalled();
  });

  it('should prioritize modal closure over settings', () => {
    const setModal = vi.fn();
    const setIsSettingsOpen = vi.fn();
    const params = createParams({
      modal: { type: 'file' as const },
      isSettingsOpen: true,
      setModal,
      setIsSettingsOpen,
    });

    renderHook(() => useKeyboardShortcuts(params));

    pressEscape();

    expect(setModal).toHaveBeenCalledWith(null);
    expect(setIsSettingsOpen).not.toHaveBeenCalled();
  });

  it('should prioritize settings over mobile sidebar', () => {
    const setIsSettingsOpen = vi.fn();
    const setIsMobileSidebarOpen = vi.fn();
    const params = createParams({
      modal: null,
      isSettingsOpen: true,
      isMobileSidebarOpen: true,
      setIsSettingsOpen,
      setIsMobileSidebarOpen,
    });

    renderHook(() => useKeyboardShortcuts(params));

    pressEscape();

    expect(setIsSettingsOpen).toHaveBeenCalledWith(false);
    expect(setIsMobileSidebarOpen).not.toHaveBeenCalled();
  });

  it('should prioritize mobile sidebar over mobile todo', () => {
    const setIsMobileSidebarOpen = vi.fn();
    const setIsMobileTodoOpen = vi.fn();
    const params = createParams({
      modal: null,
      isSettingsOpen: false,
      isMobileSidebarOpen: true,
      isMobileTodoOpen: true,
      setIsMobileSidebarOpen,
      setIsMobileTodoOpen,
    });

    renderHook(() => useKeyboardShortcuts(params));

    pressEscape();

    expect(setIsMobileSidebarOpen).toHaveBeenCalledWith(false);
    expect(setIsMobileTodoOpen).not.toHaveBeenCalled();
  });

  it('should prioritize mobile todo over file close', () => {
    const setIsMobileTodoOpen = vi.fn();
    const handleCloseFile = vi.fn();
    const params = createParams({
      modal: null,
      isSettingsOpen: false,
      isMobileSidebarOpen: false,
      isMobileTodoOpen: true,
      selectedPath: 'file.md',
      setIsMobileTodoOpen,
      handleCloseFile,
    });

    renderHook(() => useKeyboardShortcuts(params));

    pressEscape();

    expect(setIsMobileTodoOpen).toHaveBeenCalledWith(false);
    expect(handleCloseFile).not.toHaveBeenCalled();
  });

  it('should not do anything when ESC is pressed and nothing is open', () => {
    const params = createParams();

    renderHook(() => useKeyboardShortcuts(params));

    pressEscape();

    expect(params.setModal).not.toHaveBeenCalled();
    expect(params.setIsSettingsOpen).not.toHaveBeenCalled();
    expect(params.setIsMobileSidebarOpen).not.toHaveBeenCalled();
    expect(params.setIsMobileTodoOpen).not.toHaveBeenCalled();
    expect(params.handleCloseFile).not.toHaveBeenCalled();
  });

  it('should not trigger on other keys', () => {
    const params = createParams({
      modal: { type: 'file' as const },
    });

    renderHook(() => useKeyboardShortcuts(params));

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    window.dispatchEvent(event);

    expect(params.setModal).not.toHaveBeenCalled();
  });

  it('should clean up event listener on unmount', () => {
    const params = createParams();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardShortcuts(params));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('should re-register listener when dependencies change', () => {
    const params = createParams();
    const { rerender } = renderHook((props) => useKeyboardShortcuts(props), {
      initialProps: params,
    });

    // Change modal state
    const newParams = createParams({ modal: { type: 'file' as const } });
    rerender(newParams);

    pressEscape();

    expect(newParams.setModal).toHaveBeenCalledWith(null);
  });

  it('should handle all priority levels in sequence', () => {
    const setModal = vi.fn();
    const setIsSettingsOpen = vi.fn();
    const setIsMobileSidebarOpen = vi.fn();
    const setIsMobileTodoOpen = vi.fn();
    const handleCloseFile = vi.fn();

    let params = createParams({
      modal: { type: 'file' as const },
      isSettingsOpen: true,
      isMobileSidebarOpen: true,
      isMobileTodoOpen: true,
      selectedPath: 'file.md',
      setModal,
      setIsSettingsOpen,
      setIsMobileSidebarOpen,
      setIsMobileTodoOpen,
      handleCloseFile,
    });

    const { rerender } = renderHook((props) => useKeyboardShortcuts(props), {
      initialProps: params,
    });

    // Press ESC - should close modal
    pressEscape();
    expect(setModal).toHaveBeenCalledWith(null);

    // Update to no modal
    params = { ...params, modal: null };
    rerender(params);

    // Press ESC - should close settings
    pressEscape();
    expect(setIsSettingsOpen).toHaveBeenCalledWith(false);

    // Update to no settings
    params = { ...params, isSettingsOpen: false };
    rerender(params);

    // Press ESC - should close mobile sidebar
    pressEscape();
    expect(setIsMobileSidebarOpen).toHaveBeenCalledWith(false);

    // Update to no mobile sidebar
    params = { ...params, isMobileSidebarOpen: false };
    rerender(params);

    // Press ESC - should close mobile todo
    pressEscape();
    expect(setIsMobileTodoOpen).toHaveBeenCalledWith(false);

    // Update to no mobile todo
    params = { ...params, isMobileTodoOpen: false };
    rerender(params);

    // Press ESC - should close file
    pressEscape();
    expect(handleCloseFile).toHaveBeenCalled();
  });
});
