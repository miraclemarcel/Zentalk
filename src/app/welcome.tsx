import { router } from 'expo-router';
import { AudioLines, type LucideIcon, MessageSquare, SunMoon } from 'lucide-react-native';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useSettingsStore } from '@/stores/settings-store';

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: AudioLines, title: 'Just talk', body: 'Send a voice note. Zentalk listens, understands and replies.' },
  { icon: MessageSquare, title: 'Or type', body: 'For quiet moments, a fast and focused chat.' },
  { icon: SunMoon, title: 'Light or dark', body: 'Follows your system, or pick your own.' },
];

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const complete = useSettingsStore((s) => s.completeOnboarding);

  return (
    <View className="flex-1 bg-bg px-6" style={{ paddingTop: insets.top + 56, paddingBottom: insets.bottom + 20 }}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <Logo size={64} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(500)} className="mt-8">
        <Text weight="bold" className="text-[40px] leading-[46px] tracking-[-1.5px]">
          Speak your mind.{'\n'}
          <Text weight="bold" tone="muted" className="text-[40px] leading-[46px] tracking-[-1.5px]">
            Get a calm reply.
          </Text>
        </Text>
      </Animated.View>

      <View className="mt-12 gap-6">
        {FEATURES.map(({ icon: Icon, title, body }, i) => (
          <Animated.View
            key={title}
            entering={FadeInDown.delay(180 + i * 80).duration(500)}
            className="flex-row items-start gap-4">
            <View className="h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface">
              <Icon size={20} color={colors.ink} strokeWidth={1.7} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text weight="semibold" className="text-[16px]">
                {title}
              </Text>
              <Text tone="muted" className="text-[14px] leading-[20px]">
                {body}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <View className="flex-1" />

      <Animated.View entering={FadeInDown.delay(480).duration(500)} className="gap-4">
        <Button
          label="Get started"
          onPress={() => {
            complete();
            router.replace('/');
          }}
        />
        <Text tone="subtle" className="text-center text-[12px]">
          UI concept · responses are simulated
        </Text>
      </Animated.View>
    </View>
  );
}
