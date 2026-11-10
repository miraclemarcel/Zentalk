import { ArrowUp, Mic } from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/pressable-scale';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useHaptics } from '@/hooks/use-haptics';

interface Props {
  onSend: (text: string) => void;
  onVoice: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function Composer({ onSend, onVoice, disabled, autoFocus }: Props) {
  const { colors, isDark } = useAppTheme();
  const { tap, press } = useHaptics();
  const [text, setText] = useState('');
  const hasText = text.trim().length > 0;

  const submit = () => {
    if (!hasText || disabled) return;
    tap();
    onSend(text);
    setText('');
  };

  return (
    <View className="flex-row items-end gap-2 rounded-[28px] border border-line bg-surface py-1.5 pl-5 pr-1.5">
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Message Zentalk"
        placeholderTextColor={colors.subtle}
        multiline
        autoFocus={autoFocus}
        keyboardAppearance={isDark ? 'dark' : 'light'}
        selectionColor={colors.accent}
        className="font-inter max-h-32 flex-1 py-2.5 text-[16px] text-ink"
        style={{ textAlignVertical: 'center' }}
        onSubmitEditing={submit}
        submitBehavior="blurAndSubmit"
        returnKeyType="send"
      />
      <View className="h-11 w-11">
        {hasText ? (
          <Animated.View key="send" entering={ZoomIn.duration(160)} exiting={ZoomOut.duration(120)}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={submit}
              disabled={disabled}
              className={`h-11 w-11 items-center justify-center rounded-full bg-accent ${disabled ? 'opacity-40' : ''}`}>
              <ArrowUp size={20} color={colors['on-accent']} strokeWidth={2.3} />
            </PressableScale>
          </Animated.View>
        ) : (
          <Animated.View key="mic" entering={ZoomIn.duration(160)} exiting={ZoomOut.duration(120)}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Record a voice note"
              onPress={() => {
                press();
                onVoice();
              }}
              disabled={disabled}
              className={`h-11 w-11 items-center justify-center rounded-full bg-ink ${disabled ? 'opacity-40' : ''}`}>
              <Mic size={20} color={colors.bg} strokeWidth={2} />
            </PressableScale>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
