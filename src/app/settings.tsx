import Constants from 'expo-constants';
import { Check, ChevronLeft, type LucideIcon, Trash2, Vibrate, Volume2 } from 'lucide-react-native';
import { Alert, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/logo';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useHaptics } from '@/hooks/use-haptics';
import { useLeave } from '@/hooks/use-leave';
import { useChatStore } from '@/stores/chat-store';
import { type ThemeMode, useSettingsStore } from '@/stores/settings-store';
import { palette } from '@/theme/palette';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-8 px-5">
      <Text weight="semibold" tone="muted" className="pb-3 text-[13px] uppercase tracking-[1.5px]">
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Mini rendering of a theme: a phone-like card with two chat bubbles. */
function ThemePreview({ scheme }: { scheme: 'light' | 'dark' }) {
  const p = palette[scheme];
  return (
    <View className="flex-1 gap-1.5 p-2.5" style={{ backgroundColor: p.bg }}>
      <View className="h-2.5 w-3/4 rounded-full" style={{ backgroundColor: p.elevated }} />
      <View className="h-2.5 w-1/2 self-end rounded-full" style={{ backgroundColor: p.ink }} />
      <View className="h-2.5 w-2/3 rounded-full" style={{ backgroundColor: p.elevated }} />
    </View>
  );
}

const MODES: { mode: ThemeMode; label: string }[] = [
  { mode: 'system', label: 'System' },
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
];

function ThemePicker() {
  const current = useSettingsStore((s) => s.themeMode);
  const setMode = useSettingsStore((s) => s.setThemeMode);
  const { colors } = useAppTheme();
  const { select } = useHaptics();

  return (
    <View className="flex-row gap-3">
      {MODES.map(({ mode, label }) => {
        const active = current === mode;
        return (
          <PressableScale
            key={mode}
            onPress={() => {
              select();
              setMode(mode);
            }}
            className="flex-1 items-center gap-2.5">
            <View
              className={`h-24 w-full overflow-hidden rounded-2xl ${active ? 'border-2 border-accent' : 'border border-line'}`}>
              {mode === 'system' ? (
                <View className="flex-1 flex-row">
                  <ThemePreview scheme="light" />
                  <ThemePreview scheme="dark" />
                </View>
              ) : (
                <ThemePreview scheme={mode} />
              )}
            </View>
            <View className="flex-row items-center gap-1.5">
              {active ? <Check size={14} color={colors.accent} strokeWidth={2.5} /> : null}
              <Text weight={active ? 'semibold' : 'regular'} tone={active ? 'ink' : 'muted'} className="text-[14px]">
                {label}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  body,
  value,
  onChange,
  last,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View className={`flex-row items-center gap-3.5 px-4 py-3.5 ${last ? '' : 'border-b border-line'}`}>
      <Icon size={19} color={colors.ink} strokeWidth={1.8} />
      <View className="flex-1">
        <Text weight="medium" className="text-[15px]">
          {title}
        </Text>
        <Text tone="muted" className="text-[13px]">
          {body}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.accent, false: colors.line }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.line}
      />
    </View>
  );
}

export default function Settings() {
  const insets = useSafeAreaInsets();
  const leave = useLeave();
  const { colors } = useAppTheme();
  const { haptics, voiceReplies, setHaptics, setVoiceReplies } = useSettingsStore();
  const count = useChatStore((s) => Object.values(s.conversations).filter((c) => c.messages.length).length);

  const clear = () =>
    Alert.alert('Clear all conversations?', 'Every chat and voice note will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => useChatStore.getState().clearAll() },
    ]);

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-3 pb-2" style={{ paddingTop: insets.top + 6 }}>
        <IconButton
          icon={ChevronLeft}
          accessibilityLabel="Back"
          iconSize={24}
          onPress={leave}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <Text weight="semibold" className="px-5 pt-2 text-[34px] tracking-[-1.2px]">
          Settings
        </Text>

        <Section title="Appearance">
          <ThemePicker />
        </Section>

        <Section title="Voice & feel">
          <View className="overflow-hidden rounded-3xl border border-line bg-surface">
            <ToggleRow
              icon={Volume2}
              title="Read replies aloud"
              body="Zentalk speaks each answer"
              value={voiceReplies}
              onChange={setVoiceReplies}
            />
            <ToggleRow
              icon={Vibrate}
              title="Haptic feedback"
              body="Subtle taps as you interact"
              value={haptics}
              onChange={setHaptics}
              last
            />
          </View>
        </Section>

        <Section title="Data">
          <PressableScale
            scaleTo={0.98}
            onPress={clear}
            disabled={count === 0}
            className={`flex-row items-center gap-3.5 rounded-3xl border border-line bg-surface px-4 py-4 ${count === 0 ? 'opacity-50' : ''}`}>
            <Trash2 size={19} color={colors.danger} strokeWidth={1.8} />
            <Text weight="medium" tone="danger" className="flex-1 text-[15px]">
              Clear conversations
            </Text>
            <Text tone="subtle" className="text-[13px]">
              {count}
            </Text>
          </PressableScale>
        </Section>

        <View className="mt-14 items-center gap-2">
          <Logo size={28} />
          <Text tone="subtle" className="text-[12px]">
            Zentalk {Constants.expoConfig?.version ?? '1.0.0'} · UI concept
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
