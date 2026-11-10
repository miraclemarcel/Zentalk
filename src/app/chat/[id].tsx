import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/logo';
import { Composer } from '@/components/chat/composer';
import { MessageItem } from '@/components/chat/message-item';
import { Suggestions } from '@/components/home/suggestions';
import { VoiceRecorder } from '@/components/recorder/voice-recorder';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { sendText, sendVoice, stopSpeaking } from '@/services/assistant';
import { useChatStore, type VoiceClip } from '@/stores/chat-store';

type Params = { id: string; prompt?: string; voice?: string; focus?: string };

export default function Chat() {
  const { id, prompt, voice, focus } = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();
  const conversation = useChatStore((s) => s.conversations[id]);
  const [recording, setRecording] = useState(false);
  const booted = useRef(false);

  const messages = conversation?.messages ?? [];
  const reversed = useMemo(() => [...messages].reverse(), [messages]);
  const last = messages[messages.length - 1];
  const busy = !!last && last.status !== 'done' && last.status !== 'error';

  // Kick off whatever the entry point asked for (suggestion / voice), exactly once.
  useEffect(() => {
    if (booted.current || !conversation) return;
    booted.current = true;
    if (prompt) void sendText(id, prompt);
    else if (voice === '1') setRecording(true);
  }, [conversation, id, prompt, voice]);

  useEffect(() => () => stopSpeaking(), []);

  // Conversation can vanish (deleted / cleared) — leave gracefully.
  useEffect(() => {
    if (!conversation && booted.current) router.back();
  }, [conversation]);

  const confirmDelete = () =>
    Alert.alert('Delete conversation?', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          router.back();
          useChatStore.getState().deleteConversation(id);
        },
      },
    ]);

  return (
    <View className="flex-1 bg-bg">
      {/* Header */}
      <View
        className="flex-row items-center gap-2 border-b border-line px-3 pb-2.5"
        style={{ paddingTop: insets.top + 6 }}>
        <IconButton icon={ChevronLeft} accessibilityLabel="Back" iconSize={24} onPress={() => router.back()} />
        <View className="flex-1 items-center">
          <Text weight="semibold" numberOfLines={1} className="text-[16px]">
            {conversation?.title ?? 'New chat'}
          </Text>
          <Text tone={busy ? 'accent' : 'subtle'} className="text-[12px]">
            {busy ? (last?.status === 'transcribing' ? 'Listening to your note…' : 'Thinking…') : 'Zentalk'}
          </Text>
        </View>
        <IconButton
          icon={Trash2}
          iconSize={19}
          accessibilityLabel="Delete conversation"
          disabled={messages.length === 0}
          onPress={confirmDelete}
        />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {messages.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} className="flex-1 justify-center px-5">
            <View className="items-center">
              <Logo size={48} />
              <Text weight="semibold" className="mt-5 text-[26px] tracking-[-0.8px]">
                How can I help?
              </Text>
              <Text tone="muted" className="mt-1.5 text-center text-[15px]">
                Type a message, or tap the mic and just talk.
              </Text>
            </View>
            <View className="mt-10">
              <Suggestions layout="grid" onPick={(p) => void sendText(id, p)} />
            </View>
          </Animated.View>
        ) : (
          <FlatList
            data={reversed}
            inverted
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageItem message={item} />}
            contentContainerStyle={{ paddingVertical: 16 }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}

        <View className="px-4 pt-2" style={{ paddingBottom: insets.bottom + 10 }}>
          <Composer
            onSend={(t) => void sendText(id, t)}
            onVoice={() => {
              stopSpeaking();
              setRecording(true);
            }}
            disabled={busy}
            autoFocus={focus === '1'}
          />
        </View>
      </KeyboardAvoidingView>

      <VoiceRecorder
        visible={recording}
        onClose={() => setRecording(false)}
        onSend={(clip: VoiceClip) => void sendVoice(id, clip)}
      />
    </View>
  );
}
