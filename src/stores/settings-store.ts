import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsState {
  themeMode: ThemeMode;
  haptics: boolean;
  voiceReplies: boolean;
  onboarded: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setHaptics: (on: boolean) => void;
  setVoiceReplies: (on: boolean) => void;
  completeOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      haptics: true,
      voiceReplies: false,
      onboarded: false,
      setThemeMode: (themeMode) => set({ themeMode }),
      setHaptics: (haptics) => set({ haptics }),
      setVoiceReplies: (voiceReplies) => set({ voiceReplies }),
      completeOnboarding: () => set({ onboarded: true }),
    }),
    {
      name: 'zentalk.settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
