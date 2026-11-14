import { db } from '../../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { LeasePreset, LeaseClause } from './types';
import { BUILTIN_PRESETS } from './constants';

const LOCAL_STORAGE_PREFIX = 'rip_lease_presets_';
const inMemoryFallback = new Map<string, LeasePreset[]>();

function getLocalPresets(landlordId: string): LeasePreset[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return inMemoryFallback.get(landlordId) || [];
  }
  try {
    const raw = window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${landlordId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[presetService] Failed to read from localStorage:', e);
  }
  return [];
}

function saveLocalPresets(landlordId: string, presets: LeasePreset[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    inMemoryFallback.set(landlordId, presets);
    return;
  }
  try {
    window.localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${landlordId}`, JSON.stringify(presets));
  } catch (e) {
    console.warn('[presetService] Failed to write to localStorage:', e);
  }
}

/**
 * Returns all available presets for a landlord:
 * Built-in starter presets (read-only) + landlord's custom presets.
 */
export async function getPresets(landlordId: string = 'default'): Promise<LeasePreset[]> {
  const customPresets: LeasePreset[] = [];

  // Try fetching from Firestore under landlords/{landlordId}/lease_presets
  try {
    if (db && landlordId) {
      const presetsCol = collection(db, 'landlords', landlordId, 'lease_presets');
      const snap = await getDocs(presetsCol);
      snap.forEach((d) => {
        customPresets.push({
          ...d.data(),
          id: d.id,
          isBuiltIn: false
        } as LeasePreset);
      });
      // Synchronize to localStorage cache
      saveLocalPresets(landlordId, customPresets);
    }
  } catch (err) {
    console.warn('[presetService] Firestore fetch failed or offline; using local cache:', (err as Error).message);
    // Fall back to local storage cache if network error / security rule pending
    const cached = getLocalPresets(landlordId);
    if (cached.length > 0) {
      customPresets.push(...cached);
    }
  }

  // If local storage has items not yet in customPresets (e.g. offline edits), merge them
  const cached = getLocalPresets(landlordId);
  for (const c of cached) {
    if (!customPresets.some((p) => p.id === c.id)) {
      customPresets.push(c);
    }
  }

  return [...BUILTIN_PRESETS, ...customPresets];
}

/**
 * Retrieves a single preset by ID. Checks built-in first, then landlord custom presets.
 */
export async function getPresetById(presetId: string, landlordId: string = 'default'): Promise<LeasePreset | null> {
  // 1. Check built-in templates
  const builtIn = BUILTIN_PRESETS.find((p) => p.id === presetId);
  if (builtIn) {
    return JSON.parse(JSON.stringify(builtIn));
  }

  // 2. Check Firestore
  try {
    if (db && landlordId) {
      const docRef = doc(db, 'landlords', landlordId, 'lease_presets', presetId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return {
          ...snap.data(),
          id: snap.id,
          isBuiltIn: false
        } as LeasePreset;
      }
    }
  } catch (err) {
    console.warn('[presetService] getPresetById Firestore fallback:', (err as Error).message);
  }

  // 3. Check local storage cache
  const cached = getLocalPresets(landlordId);
  const foundLocal = cached.find((p) => p.id === presetId);
  if (foundLocal) {
    return JSON.parse(JSON.stringify(foundLocal));
  }

  return null;
}

/**
 * Creates a new custom preset under the landlord's account in Firestore.
 */
export async function createPreset(
  landlordId: string = 'default',
  data: Omit<LeasePreset, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'>
): Promise<LeasePreset> {
  const newId = `preset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newPreset: LeasePreset = {
    ...data,
    id: newId,
    landlordId,
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now
  };

  // 1. Save to local storage first for immediate offline reactivity
  const existing = getLocalPresets(landlordId);
  saveLocalPresets(landlordId, [newPreset, ...existing]);

  // 2. Persist to Firestore
  try {
    if (db && landlordId) {
      const docRef = doc(db, 'landlords', landlordId, 'lease_presets', newId);
      await setDoc(docRef, newPreset);
    }
  } catch (err) {
    console.warn('[presetService] createPreset Firestore write warning:', (err as Error).message);
  }

  return newPreset;
}

/**
 * Updates an existing custom preset. Built-in presets are protected and cannot be updated.
 */
export async function updatePreset(
  landlordId: string = 'default',
  presetId: string,
  updates: Partial<LeasePreset>
): Promise<void> {
  if (presetId.startsWith('builtin-') || updates.isBuiltIn) {
    throw new Error('Built-in starter presets are read-only. Duplicate this preset to create an editable custom copy.');
  }

  const now = new Date().toISOString();
  const patch = {
    ...updates,
    updatedAt: now
  };

  // Update in local cache
  const cached = getLocalPresets(landlordId);
  const updatedCache = cached.map((p) => (p.id === presetId ? { ...p, ...patch } : p));
  saveLocalPresets(landlordId, updatedCache);

  // Update in Firestore
  try {
    if (db && landlordId) {
      const docRef = doc(db, 'landlords', landlordId, 'lease_presets', presetId);
      await updateDoc(docRef, patch);
    }
  } catch (err) {
    console.warn('[presetService] updatePreset Firestore write warning:', (err as Error).message);
  }
}

/**
 * Deletes a custom preset. Built-in presets cannot be deleted.
 */
export async function deletePreset(landlordId: string = 'default', presetId: string): Promise<void> {
  if (presetId.startsWith('builtin-')) {
    throw new Error('Built-in starter presets cannot be deleted.');
  }

  // Remove from local cache
  const cached = getLocalPresets(landlordId);
  saveLocalPresets(
    landlordId,
    cached.filter((p) => p.id !== presetId)
  );

  // Remove from Firestore
  try {
    if (db && landlordId) {
      const docRef = doc(db, 'landlords', landlordId, 'lease_presets', presetId);
      await deleteDoc(docRef);
    }
  } catch (err) {
    console.warn('[presetService] deletePreset Firestore write warning:', (err as Error).message);
  }
}

/**
 * Duplicates any preset (built-in or custom) into a new editable custom preset for the landlord.
 */
export async function duplicatePreset(
  landlordId: string = 'default',
  sourcePresetId: string,
  customName?: string
): Promise<LeasePreset> {
  const source = await getPresetById(sourcePresetId, landlordId);
  if (!source) {
    throw new Error(`Preset with ID "${sourcePresetId}" was not found.`);
  }

  const clonedClauses: LeaseClause[] = source.clauses.map((c, idx) => ({
    ...c,
    id: `clause_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`
  }));

  const name = customName || `${source.name} (Copy)`;
  const description = source.description || 'Customized copy of preset';

  return createPreset(landlordId, {
    name,
    description,
    clauses: clonedClauses
  });
}

/**
 * Primary interface function exposed for Agent B and the main lease flow:
 * Retrieves active clauses for a given preset ID.
 */
export async function getPresetClauses(presetId: string, landlordId: string = 'default'): Promise<LeaseClause[]> {
  const preset = await getPresetById(presetId, landlordId);
  if (!preset) {
    // Fallback to the first built-in preset if specified preset is not found
    return BUILTIN_PRESETS[0].clauses;
  }
  return preset.clauses.filter((c) => c.enabled !== false);
}
