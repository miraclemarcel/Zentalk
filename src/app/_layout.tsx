import '@/global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { Appearance, View } from 'react-native';

import { AnimatedSplash } from '@/components/brand/animated-splash';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useHydrated } from '@/hooks/use-hydrated';
import { useSettingsStore } from '@/stores/settings-store';
import { themeVars } from '@/theme/palette';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 250, fade: true });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const hydrated = useHydrated();
  const ready = (fontsLoaded || !!fontError) && hydrated;

  const themeMode = useSettingsStore((s) => s.themeMode);
  const { scheme, isDark, colors } = useAppTheme();

  // Keep native surfaces (keyboard, alerts, switches) in sync with the chosen theme.
  useEffect(() => {
    Appearance.setColorScheme(themeMode === 'system' ? 'unspecified' : themeMode);
  }, [themeMode]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.bg);
  }, [colors.bg]);

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.bg,
        card: colors.bg,
        border: colors.line,
        text: colors.ink,
        primary: colors.accent,
      },
    };
  }, [isDark, colors]);

  return (
    <ThemeProvider value={navTheme}>
      <View style={[{ flex: 1, backgroundColor: colors.bg }, themeVars[scheme]]}>
        {ready ? (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'ios_from_right',
            }}>
            <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
          </Stack>
        ) : null}
        <AnimatedSplash ready={ready} />
      </View>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
