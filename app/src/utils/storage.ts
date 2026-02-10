/**
 * Centralized MMKV Storage
 *
 * Single encrypted MMKV instance shared across all stores.
 * NFR8: encryption at rest for all persisted data.
 * SEC-H1: encryption key stored in device keychain (not hardcoded).
 */

import { MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';

// ─────────────────────────────────────────
// Device-specific encryption key (SEC-H1)
// ─────────────────────────────────────────

const SECURE_KEY_ID = 'gentle-loop-mmkv-encryption-key';
const MIGRATION_FLAG = 'gentle-loop-mmkv-migrated';
const LEGACY_KEY = 'gentle-loop-key'; // old hardcoded key — used only for one-time migration

/**
 * Get or create a device-specific encryption key.
 * Uses expo-secure-store which is backed by:
 *   - iOS: Keychain Services (hardware-backed on devices with Secure Enclave)
 *   - Android: Android Keystore + EncryptedSharedPreferences
 *
 * The key is generated once and persisted in the device keychain.
 * It cannot be extracted even if the device filesystem is compromised
 * (unless the device is rooted/jailbroken).
 */
function getOrCreateEncryptionKey(): string {
  let key = SecureStore.getItem(SECURE_KEY_ID);

  if (!key) {
    // Generate a random 32-character hex key (128 bits of entropy)
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    key = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    SecureStore.setItem(SECURE_KEY_ID, key);
  }

  return key;
}

/**
 * Initialize MMKV with a secure device-specific encryption key.
 * Handles one-time migration from the old hardcoded key.
 */
function createSecureStorage(): MMKV {
  const secureKey = getOrCreateEncryptionKey();
  const alreadyMigrated = SecureStore.getItem(MIGRATION_FLAG);

  if (alreadyMigrated) {
    // Normal path — already using the secure key
    return new MMKV({
      id: 'gentle-loop-storage',
      encryptionKey: secureKey,
    });
  }

  // One-time migration: re-encrypt from legacy hardcoded key to secure key.
  // Opens storage with the old key, then recrypts in-place.
  const instance = new MMKV({
    id: 'gentle-loop-storage',
    encryptionKey: LEGACY_KEY,
  });
  instance.recrypt(secureKey);
  SecureStore.setItem(MIGRATION_FLAG, 'true');

  return instance;
}

/**
 * Single MMKV instance — all stores share this.
 * Encryption key is device-specific and stored in the secure keychain (SEC-H1).
 */
export const storage = createSecureStorage();

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
