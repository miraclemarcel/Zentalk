import { Redirect, router } from 'expo-router';
import { Mic, Settings2 } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Logo } from '@/components/brand/logo';
import { ConversationRow } from '@/components/home/conversation-row';
import { Suggestions } from '@/components/home/suggestions';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useHaptics } from '@/hooks/use-haptics';
import { greeting } from '@/lib/format';
import { selectRecent, useChatStore } from '@/stores/chat-store';
import { useSettingsStore } from '@/stores/settings-store';

const HERO_BARS = [0.35, 0.6, 0.9, 0.55, 0.75, 0.4, 0.65, 0.3, 0.5, 0.8, 0.45, 0.25];

function openNewChat(params: { prompt?: string; voice?: '1'; focus?: '1' } = {}) {
  const id = useChatStore.getState().createConversation();
  router.push({ pathname: '/chat/[id]', params: { id, ...params } });
}

export default function Home() {
  const onboarded = useSettingsStore((s) => s.onboarded);
  const recent = useChatStore(useShallow(selectRecent));
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { press } = useHaptics();

  if (!onboarded) return <Redirect href="/welcome" />;

  return (
    <View className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-2" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center gap-2.5">
          <Logo size={26} />
          <Text weight="semibold" className="text-[18px] tracking-[-0.4px]">
            zentalk
          </Text>
        </View>
        <IconButton
          icon={Settings2}
          variant="surface"
          accessibilityLabel="Settings"
          onPress={() => router.push('/settings')}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(450)} className="px-5 pt-6">
          <Text tone="muted" className="text-[15px]">
            {greeting()}
          </Text>
          <Text weight="semibold" className="mt-1 text-[34px] leading-[40px] tracking-[-1.2px]">
            What's on your mind?
          </Text>
        </Animated.View>

        {/* Voice hero */}
        <Animated.View entering={FadeInDown.delay(80).duration(450)} className="px-5 pt-6">
          <PressableScale
            scaleTo={0.98}
            onPress={() => {
              press();
              openNewChat({ voice: '1' });
            }}
            className="rounded-[28px] border border-line bg-surface p-5">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text weight="semibold" className="text-[18px] tracking-[-0.3px]">
                  Talk it through
                </Text>
                <Text tone="muted" className="mt-1 text-[14px] leading-[20px]">
                  Record a voice note — Zentalk listens and replies.
                </Text>
              </View>
              <View className="h-14 w-14 items-center justify-center rounded-full bg-ink">
                <Mic size={22} color={colors.bg} strokeWidth={2} />
              </View>
            </View>
            <View className="mt-6 h-8 flex-row items-center gap-[5px]">
              {HERO_BARS.map((h, i) => (
                <View key={i} className="w-1 rounded-full bg-line" style={{ height: 6 + h * 26 }} />
              ))}
            </View>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(450)} className="pt-8">
          <Text weight="semibold" tone="muted" className="px-5 pb-3 text-[13px] uppercase tracking-[1.5px]">
            Try asking
          </Text>
          <Suggestions onPick={(prompt) => openNewChat({ prompt })} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(450)} className="px-5 pt-8">
          <Text weight="semibold" tone="muted" className="pb-1 text-[13px] uppercase tracking-[1.5px]">
            Recent
          </Text>
          {recent.length === 0 ? (
            <View className="mt-2 items-center rounded-3xl border border-dashed border-line px-6 py-8">
              <Text weight="medium" className="text-[15px]">
                No conversations yet
              </Text>
              <Text tone="muted" className="mt-1 text-center text-[14px]">
                Start one below, or just tap the mic.
              </Text>
            </View>
          ) : (
            recent.slice(0, 12).map((c) => <ConversationRow key={c.id} conversation={c} />)
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom quick bar */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-line bg-bg px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}>
        <View className="flex-row items-center gap-2">
          <PressableScale
            scaleTo={0.98}
            onPress={() => openNewChat({ focus: '1' })}
            className="h-[52px] flex-1 justify-center rounded-full border border-line bg-surface px-5">
            <Text tone="subtle" className="text-[16px]">
              Ask anything
            </Text>
          </PressableScale>
          <IconButton
            icon={Mic}
            variant="inverse"
            size={52}
            iconSize={22}
            accessibilityLabel="New voice note"
            onPress={() => openNewChat({ voice: '1' })}
          />
        </View>
      </View>
    </View>
  );
}
