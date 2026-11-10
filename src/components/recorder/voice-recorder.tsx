import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { BlurView } from 'expo-blur';
import { ArrowUp, Pause, Play, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useSharedValue, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useHaptics } from '@/hooks/use-haptics';
import { formatDuration, resample } from '@/lib/format';
import type { VoiceClip } from '@/stores/chat-store';

import { LiquidOrb } from './liquid-orb';
import { LiveWave } from './live-wave';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSend: (clip: VoiceClip) => void;
}

const SAMPLE_MS = 70;
/** dBFS → 0..1 with a gentle curve so normal speech fills the range. */
const normalise = (db: number) => Math.pow(Math.min(1, Math.max(0, (db + 52) / 50)), 1.4);

export function VoiceRecorder({ visible, onClose, onSend }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      {visible ? <RecorderBody onClose={onClose} onSend={onSend} /> : null}
    </Modal>
  );
}

function RecorderBody({ onClose, onSend }: Omit<Props, 'visible'>) {
  const { isDark, colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, SAMPLE_MS);

  const level = useSharedValue(0);
  const active = useSharedValue(0);

  const [mode, setMode] = useState<'starting' | 'live' | 'demo'>('starting');
  const [paused, setPaused] = useState(false);
  const [samples, setSamples] = useState<number[]>([]);
  const [demoMs, setDemoMs] = useState(0);
  const allSamples = useRef<number[]>([]);

  // ---- start recording (falls back to a simulated demo if the mic is unavailable)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const perm = await AudioModule.requestRecordingPermissionsAsync();
        if (!perm.granted) throw new Error('denied');
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
        await recorder.prepareToRecordAsync();
        if (cancelled) return;
        recorder.record();
        setMode('live');
      } catch {
        if (!cancelled) setMode('demo');
      }
      if (!cancelled) {
        active.set(1);
        haptics.press();
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushSample = useCallback(
    (v: number) => {
      level.set(v);
      allSamples.current.push(v);
      setSamples((s) => (s.length > 80 ? [...s.slice(-60), v] : [...s, v]));
    },
    [level],
  );

  // ---- live metering
  useEffect(() => {
    if (mode !== 'live' || paused) return;
    if (typeof state.metering === 'number') pushSample(normalise(state.metering));
  }, [mode, paused, state.metering, state.durationMillis, pushSample]);

  // ---- demo: synthesise a speech-like envelope so the UI can be experienced anywhere
  useEffect(() => {
    if (mode !== 'demo' || paused) return;
    const start = Date.now() - demoMs;
    const id = setInterval(() => {
      const t = (Date.now() - start) / 1000;
      setDemoMs(Date.now() - start);
      const syllables = Math.max(0, Math.sin(t * 6.3) * Math.sin(t * 1.7 + 0.6));
      pushSample(Math.min(1, 0.08 + syllables * 0.8 + Math.random() * 0.18));
    }, SAMPLE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, paused, pushSample]);

  const durationMs = mode === 'live' ? state.durationMillis : demoMs;

  const togglePause = () => {
    haptics.tap();
    if (paused) {
      if (mode === 'live') recorder.record();
      active.set(1);
    } else {
      if (mode === 'live') recorder.pause();
      active.set(0);
      level.set(0);
    }
    setPaused(!paused);
  };

  const finish = async (send: boolean) => {
    active.set(0);
    level.set(0);
    let uri: string | null = null;
    if (mode === 'live') {
      try {
        await recorder.stop();
        uri = recorder.uri;
      } catch {
        uri = null;
      }
      void setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    }
    if (send && durationMs > 400) {
      haptics.success();
      onSend({ uri, durationMs, waveform: resample(allSamples.current, 34) });
    } else {
      haptics.tap();
    }
    onClose();
  };

  const orbSize = Math.min(width * 0.95, 400);
  const status =
    mode === 'starting' ? 'Warming up…' : paused ? 'Paused' : mode === 'demo' ? 'Listening · demo' : 'Listening…';

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <Animated.View
        entering={FadeIn.duration(220)}
        style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(6,6,9,0.86)' : 'rgba(250,250,250,0.82)' }]}
      />

      <View className="flex-1 items-center justify-between" style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 }}>
        <Animated.View entering={FadeInDown.delay(80).duration(380)} className="items-center gap-1.5">
          <Text weight="medium" tone="muted" className="text-[13px] uppercase tracking-[2px]">
            Voice note
          </Text>
          {mode === 'demo' ? (
            <Text tone="subtle" className="text-[12px]">
              Mic unavailable — showing a simulated recording
            </Text>
          ) : null}
        </Animated.View>

        <View className="items-center">
          <Animated.View entering={ZoomIn.springify().damping(14).stiffness(140)}>
            <Pressable onPress={togglePause} accessibilityRole="button" accessibilityLabel={paused ? 'Resume' : 'Pause'}>
              <LiquidOrb size={orbSize} level={level} active={active} />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(420)} className="mt-2 items-center">
            <Text weight="semibold" className="text-[46px] tracking-[-1.5px]" style={{ fontVariant: ['tabular-nums'] }}>
              {formatDuration(durationMs)}
            </Text>
            <Text tone="muted" className="mt-1 text-[15px]">
              {status}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(260).duration(500)} className="mt-7">
            <LiveWave samples={paused ? samples.map((s) => s * 0.35) : samples} width={Math.min(width - 64, 320)} />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(200).duration(420)} className="w-full items-center">
          <View className="w-full flex-row items-center justify-center gap-9 px-8">
            <GlassButton label="Discard" onPress={() => finish(false)}>
              <X size={22} color={colors.ink} strokeWidth={1.9} />
            </GlassButton>

            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Send voice note"
              scaleTo={0.92}
              onPress={() => finish(true)}
              className="h-[78px] w-[78px] items-center justify-center rounded-full bg-ink"
              style={{
                shadowColor: '#7A6DFF',
                shadowOpacity: 0.55,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 8 },
                elevation: 12,
              }}>
              <ArrowUp size={30} color={colors.bg} strokeWidth={2.2} />
            </PressableScale>

            <GlassButton label={paused ? 'Resume' : 'Pause'} onPress={togglePause}>
              {paused ? (
                <Play size={20} color={colors.ink} fill={colors.ink} strokeWidth={1.6} />
              ) : (
                <Pause size={20} color={colors.ink} fill={colors.ink} strokeWidth={1.6} />
              )}
            </GlassButton>
          </View>
          <Text tone="subtle" className="mt-5 text-[13px]">
            Tap the orb to {paused ? 'resume' : 'pause'}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

function GlassButton({ children, onPress, label }: { children: React.ReactNode; onPress: () => void; label: string }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-14 w-14 items-center justify-center rounded-full border border-ink/10 bg-ink/5">
      {children}
    </PressableScale>
  );
}
