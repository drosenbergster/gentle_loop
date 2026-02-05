/**
 * Settings Store
 * 
 * Persisted user preferences using MMKV
 */

import { create } from 'zustand';
import { createMMKV, type MMKV } from 'react-native-mmkv';

// Initialize MMKV storage (lazy)
let storage: MMKV | null = null;

function getStorage(): MMKV {
  if (!storage) {
    storage = createMMKV({ id: 'gentle-loop-settings' });
  }
  return storage;
}

interface SettingsStore {
  // User info
  userName: string;
  hasCompletedOnboarding: boolean;
  
  // Anchor image (URI or default key)
  anchorImage: string;
  
  // Accessibility
  reduceMotion: boolean;
  largerText: boolean;
  highContrast: boolean;
  
  // Actions
  setUserName: (name: string) => void;
  setOnboardingComplete: () => void;
  setAnchorImage: (uri: string) => void;
  setReduceMotion: (value: boolean) => void;
  setLargerText: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  
  // Hydrate from storage
  hydrate: () => void;
}

// Default values
const defaults = {
  userName: '',
  hasCompletedOnboarding: false,
  anchorImage: 'default-mountains',
  reduceMotion: false,
  largerText: false,
  highContrast: false,
};

// Helper to persist a value
function persist<T>(key: string, value: T) {
  const mmkv = getStorage();
  if (typeof value === 'string') {
    mmkv.set(key, value);
  } else if (typeof value === 'boolean') {
    mmkv.set(key, value);
  } else if (typeof value === 'number') {
    mmkv.set(key, value);
  }
}

// Helper to get a value with default
function getString(key: string, defaultValue: string): string {
  return getStorage().getString(key) ?? defaultValue;
}

function getBoolean(key: string, defaultValue: boolean): boolean {
  const value = getStorage().getBoolean(key);
  return value !== undefined ? value : defaultValue;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...defaults,
  
  setUserName: (name: string) => {
    persist('userName', name);
    set({ userName: name });
  },
  
  setOnboardingComplete: () => {
    persist('hasCompletedOnboarding', true);
    set({ hasCompletedOnboarding: true });
  },
  
  setAnchorImage: (uri: string) => {
    persist('anchorImage', uri);
    set({ anchorImage: uri });
  },
  
  setReduceMotion: (value: boolean) => {
    persist('reduceMotion', value);
    set({ reduceMotion: value });
  },
  
  setLargerText: (value: boolean) => {
    persist('largerText', value);
    set({ largerText: value });
  },
  
  setHighContrast: (value: boolean) => {
    persist('highContrast', value);
    set({ highContrast: value });
  },
  
  hydrate: () => {
    set({
      userName: getString('userName', defaults.userName),
      hasCompletedOnboarding: getBoolean('hasCompletedOnboarding', defaults.hasCompletedOnboarding),
      anchorImage: getString('anchorImage', defaults.anchorImage),
      reduceMotion: getBoolean('reduceMotion', defaults.reduceMotion),
      largerText: getBoolean('largerText', defaults.largerText),
      highContrast: getBoolean('highContrast', defaults.highContrast),
    });
  },
}));

// Selector hooks
export const useUserName = () => useSettingsStore(state => state.userName);
export const useHasCompletedOnboarding = () => useSettingsStore(state => state.hasCompletedOnboarding);
export const useAnchorImage = () => useSettingsStore(state => state.anchorImage);
export const useReduceMotion = () => useSettingsStore(state => state.reduceMotion);
