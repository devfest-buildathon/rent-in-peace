import { useState, useEffect, useCallback, useRef } from 'react';
import { LeasePreset, LeaseClause } from './types';
import {
  getPresets,
  getPresetById,
  createPreset,
  updatePreset,
  deletePreset,
  duplicatePreset
} from './presetService';
import { BUILTIN_PRESETS } from './constants';

export function useLeasePresets(landlordId: string = 'default') {
  const [presets, setPresets] = useState<LeasePreset[]>(BUILTIN_PRESETS);
  const [activePreset, setActivePreset] = useState<LeasePreset>(BUILTIN_PRESETS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Original copy to compare for unsaved changes
  const pristineSnapshotRef = useRef<string>(JSON.stringify(BUILTIN_PRESETS[0]));

  const loadAllPresets = useCallback(async (preferredId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await getPresets(landlordId);
      setPresets(list);

      // Select preferred preset if exists, else first available
      let target = list[0];
      if (preferredId) {
        const found = list.find((p) => p.id === preferredId);
        if (found) target = found;
      }
      setActivePreset(JSON.parse(JSON.stringify(target)));
      pristineSnapshotRef.current = JSON.stringify(target);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    loadAllPresets();
  }, [loadAllPresets]);

  // Check unsaved changes whenever activePreset changes
  const updateDraft = useCallback((updater: (prev: LeasePreset) => LeasePreset) => {
    setActivePreset((prev) => {
      const updated = updater(prev);
      const isDifferent = JSON.stringify(updated) !== pristineSnapshotRef.current;
      setHasUnsavedChanges(isDifferent);
      return updated;
    });
  }, []);

  const selectPreset = useCallback(
    async (presetId: string, force: boolean = false): Promise<boolean> => {
      if (hasUnsavedChanges && !force) {
        return false; // Caller should prompt user
      }
      const found = presets.find((p) => p.id === presetId);
      if (found) {
        const deepCopy = JSON.parse(JSON.stringify(found));
        setActivePreset(deepCopy);
        pristineSnapshotRef.current = JSON.stringify(deepCopy);
        setHasUnsavedChanges(false);
        return true;
      }
      return false;
    },
    [presets, hasUnsavedChanges]
  );

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!activePreset) return false;
    if (activePreset.isBuiltIn) {
      setError('Built-in starter presets are read-only. Duplicate it to save your customized version.');
      return false;
    }
    if (!activePreset.name.trim()) {
      setError('Preset name cannot be empty.');
      return false;
    }

    setIsSaving(true);
    setError(null);
    try {
      await updatePreset(landlordId, activePreset.id, {
        name: activePreset.name.trim(),
        description: activePreset.description.trim(),
        clauses: activePreset.clauses
      });
      pristineSnapshotRef.current = JSON.stringify(activePreset);
      setHasUnsavedChanges(false);
      // Refresh list
      const updatedList = await getPresets(landlordId);
      setPresets(updatedList);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [activePreset, landlordId]);

  const handleCreateNew = useCallback(
    async (name: string, description: string = '', baseClauses?: LeaseClause[]): Promise<LeasePreset | null> => {
      setIsSaving(true);
      setError(null);
      try {
        const clausesToUse = baseClauses && baseClauses.length > 0 ? baseClauses : BUILTIN_PRESETS[0].clauses;
        const newPreset = await createPreset(landlordId, {
          name: name.trim() || 'Custom Lease Preset',
          description: description.trim(),
          clauses: clausesToUse
        });
        const updatedList = await getPresets(landlordId);
        setPresets(updatedList);
        setActivePreset(JSON.parse(JSON.stringify(newPreset)));
        pristineSnapshotRef.current = JSON.stringify(newPreset);
        setHasUnsavedChanges(false);
        return newPreset;
      } catch (err) {
        setError((err as Error).message);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [landlordId]
  );

  const handleDuplicate = useCallback(
    async (sourceId?: string, customName?: string): Promise<LeasePreset | null> => {
      const targetId = sourceId || activePreset?.id;
      if (!targetId) return null;

      setIsSaving(true);
      setError(null);
      try {
        const duplicated = await duplicatePreset(landlordId, targetId, customName);
        const updatedList = await getPresets(landlordId);
        setPresets(updatedList);
        setActivePreset(JSON.parse(JSON.stringify(duplicated)));
        pristineSnapshotRef.current = JSON.stringify(duplicated);
        setHasUnsavedChanges(false);
        return duplicated;
      } catch (err) {
        setError((err as Error).message);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [activePreset, landlordId]
  );

  const handleDelete = useCallback(
    async (presetId?: string): Promise<boolean> => {
      const targetId = presetId || activePreset?.id;
      if (!targetId) return false;
      if (targetId.startsWith('builtin-')) {
        setError('Built-in starter presets cannot be deleted.');
        return false;
      }

      setIsSaving(true);
      setError(null);
      try {
        await deletePreset(landlordId, targetId);
        const updatedList = await getPresets(landlordId);
        setPresets(updatedList);
        // Switch to the first preset
        const fallback = updatedList[0] || BUILTIN_PRESETS[0];
        setActivePreset(JSON.parse(JSON.stringify(fallback)));
        pristineSnapshotRef.current = JSON.stringify(fallback);
        setHasUnsavedChanges(false);
        return true;
      } catch (err) {
        setError((err as Error).message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [activePreset, landlordId]
  );

  // Clause manipulation helpers
  const toggleClause = useCallback(
    (clauseId: string) => {
      updateDraft((prev) => ({
        ...prev,
        clauses: prev.clauses.map((c) => (c.id === clauseId ? { ...c, enabled: !c.enabled } : c))
      }));
    },
    [updateDraft]
  );

  const addClause = useCallback(
    (newClause: Omit<LeaseClause, 'id'>) => {
      const id = `clause_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      updateDraft((prev) => ({
        ...prev,
        clauses: [...prev.clauses, { ...newClause, id, enabled: true }]
      }));
    },
    [updateDraft]
  );

  const updateClause = useCallback(
    (clauseId: string, updates: Partial<LeaseClause>) => {
      updateDraft((prev) => ({
        ...prev,
        clauses: prev.clauses.map((c) => (c.id === clauseId ? { ...c, ...updates } : c))
      }));
    },
    [updateDraft]
  );

  const removeClause = useCallback(
    (clauseId: string) => {
      updateDraft((prev) => ({
        ...prev,
        clauses: prev.clauses.filter((c) => c.id !== clauseId)
      }));
    },
    [updateDraft]
  );

  const moveClauseUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      updateDraft((prev) => {
        const updated = [...prev.clauses];
        const temp = updated[index - 1];
        updated[index - 1] = updated[index];
        updated[index] = temp;
        return { ...prev, clauses: updated };
      });
    },
    [updateDraft]
  );

  const moveClauseDown = useCallback(
    (index: number) => {
      updateDraft((prev) => {
        if (index >= prev.clauses.length - 1) return prev;
        const updated = [...prev.clauses];
        const temp = updated[index + 1];
        updated[index + 1] = updated[index];
        updated[index] = temp;
        return { ...prev, clauses: updated };
      });
    },
    [updateDraft]
  );

  return {
    presets,
    activePreset,
    setActivePreset,
    isLoading,
    isSaving,
    error,
    setError,
    hasUnsavedChanges,
    selectPreset,
    updateDraft,
    handleSave,
    handleCreateNew,
    handleDuplicate,
    handleDelete,
    toggleClause,
    addClause,
    updateClause,
    removeClause,
    moveClauseUp,
    moveClauseDown,
    reloadPresets: loadAllPresets
  };
}
