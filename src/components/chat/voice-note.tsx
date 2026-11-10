import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pause, Play } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useHaptics } from '@/hooks/use-haptics';
import { formatDuration } from '@/lib/format';
import type { VoiceClip } from '@/stores/chat-store';

/**
 * Plays the real recording when there is one; for demo clips (no file) it
 * runs a timed progress so the interaction still feels complete.
 */
function usePlayback(clip: VoiceClip) {
  const player = useAudioPlayer(clip.uri ? { uri: clip.uri } : null);
  const status = useAudioPlayerStatus(player);
  const [fake, setFake] = useState<{ playing: boolean; ms: number }>({ playing: false, ms: 0 });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  useEffect(() => {
    if (status.didJustFinish) {
      player.pause();
      void player.seekTo(0);
    }
  }, [status.didJustFinish, player]);

  if (clip.uri) {
    const total = (status.duration || clip.durationMs / 1000) * 1000;
    return {
      playing: status.playing,
      progress: total > 0 ? Math.min(1, (status.currentTime * 1000) / total) : 0,
      elapsed: status.currentTime * 1000,
      toggle: () => (status.playing ? player.pause() : player.play()),
    };
  }

  const toggle = () => {
    if (fake.playing) {
      if (timer.current) clearInterval(timer.current);
      setFake((f) => ({ ...f, playing: false }));
      return;
    }
    const startAt = Date.now() - (fake.ms >= clip.durationMs ? 0 : fake.ms);
    setFake((f) => ({ ...f, playing: true }));
    timer.current = setInterval(() => {
      const ms = Date.now() - startAt;
      if (ms >= clip.durationMs) {
        if (timer.current) clearInterval(timer.current);
        setFake({ playing: false, ms: 0 });
      } else setFake({ playing: true, ms });
    }, 50);
  };

  return { playing: fake.playing, progress: fake.ms / clip.durationMs, elapsed: fake.ms, toggle };
}

interface Props {
  clip: VoiceClip;
  transcript: string;
  transcribing: boolean;
}

export function VoiceNote({ clip, transcript, transcribing }: Props) {
  const { colors } = useAppTheme();
  const { tap } = useHaptics();
  const { playing, progress, elapsed, toggle } = usePlayback(clip);

  return (
    <View className="max-w-[82%] self-end">
      <View className="flex-row items-center gap-3 rounded-[26px] rounded-br-md bg-ink py-2.5 pl-2.5 pr-4">
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause voice note' : 'Play voice note'}
          onPress={() => {
            tap();
            toggle();
          }}
          className="h-10 w-10 items-center justify-center rounded-full bg-bg">
          {playing ? (
            <Pause size={16} color={colors.ink} fill={colors.ink} strokeWidth={1.5} />
          ) : (
            <Play size={16} color={colors.ink} fill={colors.ink} strokeWidth={1.5} style={{ marginLeft: 2 }} />
          )}
        </PressableScale>

        <View className="h-8 flex-row items-center gap-[2.5px]">
          {clip.waveform.map((v, i) => {
            const played = i / clip.waveform.length < progress;
            return (
              <View
                key={i}
                className={`w-[3px] rounded-full ${played ? 'bg-accent' : 'bg-bg/40'}`}
                style={{ height: Math.max(4, v * 28) }}
              />
            );
          })}
        </View>

        <Text tone="bg" weight="medium" className="text-[12px] opacity-70" style={{ fontVariant: ['tabular-nums'] }}>
          {formatDuration(playing || elapsed > 0 ? elapsed : clip.durationMs)}
        </Text>
      </View>

      <View className="mt-1.5 px-2">
        {transcribing ? (
          <Text tone="subtle" className="text-right text-[13px] italic">
            Transcribing…
          </Text>
        ) : (
          <Text tone="muted" className="text-right text-[13px] leading-[18px]">
            “{transcript}”
          </Text>
        )}
      </View>
    </View>
  );
}
