import { router } from 'expo-router';
import { AudioLines, MessageSquare } from 'lucide-react-native';
import { View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { formatRelative } from '@/lib/format';
import type { Conversation } from '@/stores/chat-store';

export function ConversationRow({ conversation }: { conversation: Conversation }) {
  const { colors } = useAppTheme();
  const last = conversation.messages[conversation.messages.length - 1];
  const hasVoice = conversation.messages.some((m) => m.kind === 'voice');
  const Icon = hasVoice ? AudioLines : MessageSquare;

  return (
    <PressableScale
      scaleTo={0.98}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: conversation.id } })}
      className="flex-row items-center gap-3.5 py-3">
      <View className="h-11 w-11 items-center justify-center rounded-2xl border border-line bg-surface">
        <Icon size={18} color={colors.muted} strokeWidth={1.8} />
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-3">
          <Text weight="medium" numberOfLines={1} className="flex-1 text-[15px]">
            {conversation.title}
          </Text>
          <Text tone="subtle" className="text-[12px]">
            {formatRelative(conversation.updatedAt)}
          </Text>
        </View>
        <Text tone="muted" numberOfLines={1} className="text-[14px]">
          {last?.role === 'user' && last.kind === 'voice' ? 'Voice note · ' : ''}
          {last?.text || '…'}
        </Text>
      </View>
    </PressableScale>
  );
}
