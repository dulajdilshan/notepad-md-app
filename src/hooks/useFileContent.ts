import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchFile, saveFile } from '../api/client';
import { AUTO_SAVE_DELAY, SAVE_INDICATOR_DELAY } from '../constants';

export function useFileContent(filePath: string | null) {
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isDirty = content !== savedContent;

  useEffect(() => {
    if (!filePath) {
      setContent('');
      setSavedContent('');
      return;
    }

    setLoading(true);
    fetchFile(filePath)
      .then((data) => {
        setContent(data);
        setSavedContent(data);
      })
      .catch((err) => console.error('Failed to load file:', err))
      .finally(() => setLoading(false));
  }, [filePath]);

  const save = useCallback(async () => {
    if (!filePath || !isDirty) return;
    setSaving(true);
    try {
      await saveFile(filePath, content);
      setSavedContent(content);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setTimeout(() => setSaving(false), SAVE_INDICATOR_DELAY); // Small delay to show "Saving..."
    }
  }, [filePath, content, isDirty]);

  // Debounced auto-save
  useEffect(() => {
    if (!isDirty || !filePath) return;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await saveFile(filePath, content);
        setSavedContent(content);
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setTimeout(() => setSaving(false), SAVE_INDICATOR_DELAY);
      }
    }, AUTO_SAVE_DELAY);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [content, isDirty, filePath]);

  // Ctrl+S handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [save]);

  return { content, setContent, loading, isDirty, save, saving };
}
