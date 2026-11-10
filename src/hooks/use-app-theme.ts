import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/stores/settings-store';
import { palette, type Scheme } from '@/theme/palette';

/** Resolves the user's theme preference against the system scheme. */
export function useAppTheme() {
  const mode = useSettingsStore((s) => s.themeMode);
  const system = useColorScheme();
  const scheme: Scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  return { scheme, isDark: scheme === 'dark', colors: palette[scheme] };
}
