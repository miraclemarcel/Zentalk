import { Volume2 } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Logo } from '@/components/brand/logo';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { speak } from '@/services/assistant';
import type { Message } from '@/stores/chat-store';

import { TypingIndicator } from './typing-indicator';
import { VoiceNote } from './voice-note';

function MessageItemBase({ message }: { message: Message }) {
  const { colors } = useAppTheme();

  if (message.role === 'user') {
    return (
      <Animated.View entering={FadeInDown.duration(260)} className="px-5 py-1.5">
        {message.kind === 'voice' && message.voice ? (
          <VoiceNote
            clip={message.voice}
            transcript={message.text}
            transcribing={message.status === 'transcribing'}
          />
        ) : (
          <View className="max-w-[82%] self-end rounded-[22px] rounded-br-md bg-ink px-4 py-3">
            <Text tone="bg" className="text-[16px] leading-[22px]">
              {message.text}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  }

  const thinking = message.status === 'thinking';
  const done = message.status === 'done';

  return (
    <Animated.View entering={FadeInDown.duration(260)} className="flex-row gap-3 px-5 py-3">
      <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-full border border-line bg-surface">
        <Logo size={16} />
      </View>
      <View className="flex-1">
        {thinking ? (
          <TypingIndicator />
        ) : (
          <Text tone={message.status === 'error' ? 'danger' : 'ink'} className="text-[16px] leading-[25px]">
            {message.text}
          </Text>
        )}
        {done && message.text ? (
          <Pressable
            onPress={() => speak(message.text)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Read reply aloud"
            className="mt-2.5 h-7 w-7 items-center justify-center rounded-full">
            <Volume2 size={16} color={colors.muted} strokeWidth={1.8} />
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

export const MessageItem = memo(MessageItemBase);
