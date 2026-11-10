import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

import { useSettingsStore } from '@/stores/settings-store';

export function useHaptics() {
  const enabled = useSettingsStore((s) => s.haptics);

  const tap = useCallback(() => {
    if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [enabled]);

  const press = useCallback(() => {
    if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [enabled]);

  const success = useCallback(() => {
    if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [enabled]);

  const select = useCallback(() => {
    if (enabled) void Haptics.selectionAsync();
  }, [enabled]);

  return { tap, press, success, select };
}
