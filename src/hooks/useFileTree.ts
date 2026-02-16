import { useState, useEffect, useCallback } from 'react';
import type { TreeNode } from '../types';
import { fetchTree, checkBrowserSession, restoreBrowserSession } from '../api/client';
import { useSettings } from '../contexts/SettingsContext';

export function useFileTree() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const { rootPath, refreshKey } = useSettings();

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTree();
      setTree(data);
    } catch (err) {
      console.error('Failed to load file tree:', err);
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, [rootPath, refreshKey]);

  useEffect(() => {
    async function load() {
      if (!rootPath) {
        setLoading(false);
        setTree([]);
        return;
      }

      if (rootPath === 'BROWSER_NATIVE') {
        const sessionStatus = await checkBrowserSession();
        if (sessionStatus === 'needs-permission') {
          setPermissionNeeded(true);
          setLoading(false);
          return;
        }
      }

      refresh();
    }

    load();
  }, [refresh, rootPath, refreshKey]);

  const restoreSession = async () => {
    const success = await restoreBrowserSession();
    if (success) {
      setPermissionNeeded(false);
      refresh();
    }
    return success;
  };

  return { tree, loading, refresh, permissionNeeded, restoreSession };
}
