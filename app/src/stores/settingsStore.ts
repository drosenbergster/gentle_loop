/**
 * Settings Store
 *
 * Persisted user preferences using Zustand persist middleware + MMKV.
 * Single source of truth for all app settings.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage, STORAGE_KEYS } from '../utils/storage';

/** Response mode for AI interactions */
export type ResponseMode = 'text' | 'audio' | 'both';

/** TTS playback speed */
export type TTSSpeed = 'slower' | 'default' | 'faster';

interface SettingsState {
  // User info
  userName: string;
  hasCompletedOnboarding: boolean;

  // Anchor image (URI or default key)
  anchorImage: string;

  // Accessibility
  reduceMotion: boolean;
  largerText: boolean;
  highContrast: boolean;

  // AI response preferences
  responseMode: ResponseMode;
  ttsSpeed: TTSSpeed;
}

interface SettingsActions {
  setUserName: (name: string) => void;
  setOnboardingComplete: () => void;
  setAnchorImage: (uri: string) => void;
  setReduceMotion: (value: boolean) => void;
  setLargerText: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setResponseMode: (mode: ResponseMode) => void;
  setTTSSpeed: (speed: TTSSpeed) => void;
}

type SettingsStore = SettingsState & SettingsActions;

/** Default values for all settings */
const defaults: SettingsState = {
  userName: '',
  hasCompletedOnboarding: false,
  anchorImage: 'default-mountains',
  reduceMotion: false,
  largerText: false,
  highContrast: false,
  responseMode: 'both',
  ttsSpeed: 'default',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaults,

      setUserName: (name: string) => set({ userName: name }),
      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      setAnchorImage: (uri: string) => set({ anchorImage: uri }),
      setReduceMotion: (value: boolean) => set({ reduceMotion: value }),
      setLargerText: (value: boolean) => set({ largerText: value }),
      setHighContrast: (value: boolean) => set({ highContrast: value }),
      setResponseMode: (mode: ResponseMode) => set({ responseMode: mode }),
      setTTSSpeed: (speed: TTSSpeed) => set({ ttsSpeed: speed }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

// Selector hooks
export const useUserName = () => useSettingsStore((state) => state.userName);
export const useHasCompletedOnboarding = () =>
  useSettingsStore((state) => state.hasCompletedOnboarding);
export const useAnchorImage = () =>
  useSettingsStore((state) => state.anchorImage);
export const useReduceMotion = () =>
  useSettingsStore((state) => state.reduceMotion);
