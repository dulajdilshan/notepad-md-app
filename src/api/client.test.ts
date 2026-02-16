import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setAdapter, getAdapterType } from './client';
import { LOCAL_STORAGE_KEYS } from '../constants';

describe('client adapter switcher', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('setAdapter', () => {
    it('should set adapter type to browser', () => {
      setAdapter('browser');

      const storedType = localStorage.getItem(LOCAL_STORAGE_KEYS.ADAPTER_TYPE);
      expect(storedType).toBe('browser');
    });

    it('should set adapter type to local-storage', () => {
      setAdapter('local-storage');

      const storedType = localStorage.getItem(LOCAL_STORAGE_KEYS.ADAPTER_TYPE);
      expect(storedType).toBe('local-storage');
    });

    it('should overwrite existing adapter type', () => {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADAPTER_TYPE, 'browser');

      setAdapter('local-storage');

      const storedType = localStorage.getItem(LOCAL_STORAGE_KEYS.ADAPTER_TYPE);
      expect(storedType).toBe('local-storage');
    });
  });

  describe('getAdapterType', () => {
    it('should return stored adapter type', () => {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADAPTER_TYPE, 'browser');

      const type = getAdapterType();
      expect(type).toBe('browser');
    });

    it('should return local-storage as default when not set', () => {
      const type = getAdapterType();
      expect(type).toBe('local-storage');
    });

    it('should return stored local-storage type', () => {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADAPTER_TYPE, 'local-storage');

      const type = getAdapterType();
      expect(type).toBe('local-storage');
    });
  });
});
