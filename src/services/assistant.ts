/**
 * Zentalk assistant — UI-concept implementation.
 *
 * `transcribe` and `generateReply` are mocked so the app runs with zero setup.
 * To go live, replace their bodies with calls to your backend, e.g.
 *   transcribe:    POST the recording (clip.uri) to a speech-to-text endpoint
 *   generateReply: POST the conversation to an LLM endpoint and stream tokens back
 * Everything else (store updates, streaming UI, spoken replies) already works.
 */
import * as Speech from 'expo-speech';

import { titleFrom } from '@/lib/format';
import { type Message, type VoiceClip, useChatStore } from '@/stores/chat-store';
import { useSettingsStore } from '@/stores/settings-store';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- mocks

const SAMPLE_TRANSCRIPTS = [
  'Can you help me plan a calm, productive morning routine?',
  "I keep procrastinating on a big project. How do I actually get started?",
  'Give me three ideas for a quick, healthy dinner tonight.',
  'Explain how noise cancelling headphones work, simply.',
  "What's a good way to wind down before sleep?",
];

async function transcribe(clip: VoiceClip): Promise<string> {
  await wait(900 + Math.min(clip.durationMs, 6000) * 0.12);
  const index = Math.floor(clip.durationMs / 700) % SAMPLE_TRANSCRIPTS.length;
  return SAMPLE_TRANSCRIPTS[index];
}

const REPLIES: { match: RegExp; text: string }[] = [
  {
    match: /morning|routine/i,
    text: "Here's a gentle routine that works for most people:\n\n1. Wake at the same time daily — consistency beats an early alarm.\n2. Get daylight within 15 minutes. It anchors your body clock.\n3. Water before coffee.\n4. Pick one meaningful task and do it before checking messages.\n\nStart with just two of these for a week, then add the rest.",
  },
  {
    match: /procrastinat|get started|project/i,
    text: "Procrastination is usually about the task feeling fuzzy, not about laziness.\n\nTry this: open the project and write the single smallest next step — something you could finish in 10 minutes. Set a timer, do only that, then stop if you want. Momentum tends to carry you further than motivation ever will.",
  },
  {
    match: /dinner|recipe|cook|food/i,
    text: 'Three quick ones, all under 20 minutes:\n\n• Garlic chickpea & spinach skillet with a squeeze of lemon\n• Soy-ginger salmon with microwave rice and cucumber\n• Black bean tacos with avocado, lime and crunchy cabbage\n\nWant a shopping list for any of these?',
  },
  {
    match: /noise|headphone/i,
    text: 'Tiny microphones on the headphones listen to the sound around you. A chip then creates the exact opposite sound wave and plays it alongside your music. When the two waves meet, they cancel out — so steady noise like engines or fans mostly disappears.',
  },
  {
    match: /sleep|wind down|relax/i,
    text: "A simple wind-down:\n\n• Dim the lights an hour before bed\n• Put your phone across the room\n• Write tomorrow's top three tasks so your mind can let go\n• A few minutes of slow breathing — in for 4, out for 6\n\nKeep it the same every night and your body starts to expect sleep.",
  },
  {
    match: /^(hi|hey|hello|yo)\b/i,
    text: "Hey! I'm Zentalk. Type or just hold a thought out loud — tap the mic and talk to me like you would a friend. What's on your mind?",
  },
];

const FALLBACK =
  "Good question. Here's how I'd think about it:\n\nStart by naming what outcome you actually want, then work backwards to the first concrete step. If you share a bit more context, I can get much more specific.";

async function* generateReply(history: Message[]): AsyncGenerator<string> {
  const last = [...history].reverse().find((m) => m.role === 'user');
  const text = REPLIES.find((r) => r.match.test(last?.text ?? ''))?.text ?? FALLBACK;
  await wait(700);
  // Stream word-by-word for a natural feel.
  const tokens = text.match(/\S+\s*/g) ?? [];
  for (const t of tokens) {
    await wait(18 + Math.random() * 40);
    yield t;
  }
}

// ---------------------------------------------------------------- orchestration

async function respond(conversationId: string) {
  const store = useChatStore.getState();
  const replyId = store.addMessage(conversationId, {
    role: 'assistant',
    kind: 'text',
    text: '',
    status: 'thinking',
  });

  let full = '';
  try {
    const history = useChatStore.getState().conversations[conversationId]?.messages ?? [];
    for await (const token of generateReply(history)) {
      full += token;
      useChatStore.getState().updateMessage(conversationId, replyId, {
        text: full,
        status: 'streaming',
      });
    }
    useChatStore.getState().updateMessage(conversationId, replyId, { status: 'done' });
    if (useSettingsStore.getState().voiceReplies) speak(full);
  } catch {
    useChatStore.getState().updateMessage(conversationId, replyId, {
      status: 'error',
      text: 'Something went wrong. Try again.',
    });
  }
}

function maybeTitle(conversationId: string, text: string) {
  const c = useChatStore.getState().conversations[conversationId];
  if (c && c.title === 'New chat') useChatStore.getState().setTitle(conversationId, titleFrom(text));
}

export async function sendText(conversationId: string, text: string) {
  const clean = text.trim();
  if (!clean) return;
  useChatStore.getState().addMessage(conversationId, {
    role: 'user',
    kind: 'text',
    text: clean,
    status: 'done',
  });
  maybeTitle(conversationId, clean);
  await respond(conversationId);
}

export async function sendVoice(conversationId: string, clip: VoiceClip) {
  const store = useChatStore.getState();
  const id = store.addMessage(conversationId, {
    role: 'user',
    kind: 'voice',
    text: '',
    status: 'transcribing',
    voice: clip,
  });
  const transcript = await transcribe(clip);
  useChatStore.getState().updateMessage(conversationId, id, { text: transcript, status: 'done' });
  maybeTitle(conversationId, transcript);
  await respond(conversationId);
}

export function speak(text: string) {
  Speech.stop();
  Speech.speak(text.replace(/[•\n]+/g, '. '), { rate: 1, pitch: 1 });
}

export function stopSpeaking() {
  Speech.stop();
}
