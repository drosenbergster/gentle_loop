/**
 * Tests for centralized MMKV storage utility
 */

import { storage, STORAGE_KEYS, mmkvStorage } from '../src/utils/storage';

describe('Centralized MMKV Storage', () => {
  describe('storage instance', () => {
    it('should be defined', () => {
      expect(storage).toBeDefined();
    });

    it('should have encryption key configured (MMKV constructor called with encryptionKey)', () => {
      const { MMKV } = require('react-native-mmkv');
      expect(MMKV).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'gentle-loop-storage',
          encryptionKey: 'gentle-loop-key',
        }),
      );
    });

    it('should set and get a string value', () => {
      storage.set('test-string', 'hello');
      expect(storage.getString('test-string')).toBe('hello');
    });

    it('should set and get a boolean value', () => {
      storage.set('test-bool', true);
      expect(storage.getBoolean('test-bool')).toBe(true);
    });

    it('should delete a key', () => {
      storage.set('to-delete', 'value');
      expect(storage.getString('to-delete')).toBe('value');
      storage.delete('to-delete');
      expect(storage.getString('to-delete')).toBeUndefined();
    });

    it('should return undefined for missing keys', () => {
      expect(storage.getString('nonexistent')).toBeUndefined();
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have settings key', () => {
      expect(STORAGE_KEYS.SETTINGS).toBe('settings-storage');
    });

    it('should have energy key', () => {
      expect(STORAGE_KEYS.ENERGY).toBe('energy-storage');
    });

    it('should have toolbox key', () => {
      expect(STORAGE_KEYS.TOOLBOX).toBe('toolbox-storage');
    });
  });

  describe('mmkvStorage (Zustand adapter)', () => {
    it('should set and get an item', () => {
      mmkvStorage.setItem('zustand-key', '{"foo":"bar"}');
      expect(mmkvStorage.getItem('zustand-key')).toBe('{"foo":"bar"}');
    });

    it('should return null for missing items', () => {
      expect(mmkvStorage.getItem('missing-key')).toBeNull();
    });

    it('should remove an item', () => {
      mmkvStorage.setItem('remove-me', 'data');
      mmkvStorage.removeItem('remove-me');
      expect(mmkvStorage.getItem('remove-me')).toBeNull();
    });
  });
});
