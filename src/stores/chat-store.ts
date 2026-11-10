import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { uid } from '@/lib/id';

export type Role = 'user' | 'assistant';
export type MessageStatus = 'transcribing' | 'thinking' | 'streaming' | 'done' | 'error';

export interface VoiceClip {
  uri: string | null;
  durationMs: number;
  /** Normalised 0–1 amplitudes, already downsampled for display. */
  waveform: number[];
}

export interface Message {
  id: string;
  role: Role;
  kind: 'text' | 'voice';
  text: string;
  status: MessageStatus;
  createdAt: number;
  voice?: VoiceClip;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

interface ChatState {
  conversations: Record<string, Conversation>;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  clearAll: () => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'createdAt'>) => string;
  updateMessage: (conversationId: string, messageId: string, patch: Partial<Message>) => void;
  setTitle: (conversationId: string, title: string) => void;
}

const touch = (c: Conversation, patch: Partial<Conversation>): Conversation => ({
  ...c,
  ...patch,
  updatedAt: Date.now(),
});

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: {},

      createConversation: () => {
        const id = uid();
        const now = Date.now();
        set((s) => ({
          conversations: {
            ...s.conversations,
            [id]: { id, title: 'New chat', createdAt: now, updatedAt: now, messages: [] },
          },
        }));
        return id;
      },

      deleteConversation: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.conversations;
          return { conversations: rest };
        }),

      clearAll: () => set({ conversations: {} }),

      addMessage: (conversationId, message) => {
        const id = uid();
        set((s) => {
          const c = s.conversations[conversationId];
          if (!c) return s;
          const next: Message = { ...message, id, createdAt: Date.now() };
          return {
            conversations: {
              ...s.conversations,
              [conversationId]: touch(c, { messages: [...c.messages, next] }),
            },
          };
        });
        return id;
      },

      updateMessage: (conversationId, messageId, patch) =>
        set((s) => {
          const c = s.conversations[conversationId];
          if (!c) return s;
          return {
            conversations: {
              ...s.conversations,
              [conversationId]: touch(c, {
                messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
              }),
            },
          };
        }),

      setTitle: (conversationId, title) =>
        set((s) => {
          const c = s.conversations[conversationId];
          if (!c) return s;
          return { conversations: { ...s.conversations, [conversationId]: { ...c, title } } };
        }),
    }),
    {
      name: 'zentalk.chats',
      storage: createJSONStorage(() => AsyncStorage),
      // Drop empty drafts and never persist a half-finished stream.
      partialize: (s) => ({
        conversations: Object.fromEntries(
          Object.entries(s.conversations)
            .filter(([, c]) => c.messages.length > 0)
            .map(([id, c]) => [
              id,
              {
                ...c,
                messages: c.messages.map((m) =>
                  m.status === 'done' ? m : { ...m, status: 'done' as const },
                ),
              },
            ]),
        ),
      }),
    },
  ),
);

/** Conversations sorted most-recent first, excluding empty drafts. */
export const selectRecent = (s: ChatState) =>
  Object.values(s.conversations)
    .filter((c) => c.messages.length > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt);
