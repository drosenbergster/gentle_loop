/**
 * Centralized MMKV Storage
 *
 * Single encrypted MMKV instance shared across all stores.
 * NFR8: encryption at rest for all persisted data.
 */

import { MMKV } from 'react-native-mmkv';

/**
 * Single MMKV instance — all stores share this.
 * Encryption key ensures data at rest is encrypted (NFR8).
 */
export const storage = new MMKV({
  id: 'gentle-loop-storage',
  encryptionKey: 'gentle-loop-key',
});

/**
 * Storage key constants — prevents typos and centralizes key naming.
 */
export const STORAGE_KEYS = {
  SETTINGS: 'settings-storage',
  ENERGY: 'energy-storage',
  TOOLBOX: 'toolbox-storage',
} as const;

/**
 * Zustand-compatible storage adapter for createJSONStorage.
 * Use with: createJSONStorage(() => mmkvStorage)
 */
export const mmkvStorage = {
  getItem: (name: string): string | null => {
    return storage.getString(name) ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.delete(name);
  },
};
