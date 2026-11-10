import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-app-theme';

import { barX, MARK } from './mark';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/** Must match the native splash (app.json → expo-splash-screen.imageWidth). */
const SIZE = 112;

const SPLASH = {
  dark: { bg: '#09090B', bubble: '#F5F5F7', accent: '#8F87FF' },
  light: { bg: '#FAFAFA', bubble: '#0B0B0F', accent: '#5B4FF5' },
} as const;

function Bar({ index, wave, color }: { index: number; wave: SharedValue<number>; color: string }) {
  const base = MARK.bars[index];
  const props = useAnimatedProps(() => {
    // Envelope rises then settles so the mark "speaks" once and lands on its resting shape.
    const env = Math.sin(wave.value * Math.PI);
    const s = 1 + 0.42 * env * Math.sin(wave.value * Math.PI * 5 + index * 1.1);
    const h = Math.max(MARK.barWidth, base * s);
    return { height: h, y: MARK.bubble.cy - h / 2 };
  });
  return (
    <AnimatedRect
      x={barX(index)}
      width={MARK.barWidth}
      rx={MARK.barWidth / 2}
      fill={color}
      animatedProps={props}
    />
  );
}

/**
 * Picks up exactly where the native splash leaves off (same color, size, position),
 * lets the waveform pulse once, reveals the wordmark, then dissolves into the app.
 */
export function AnimatedSplash({ ready }: { ready: boolean }) {
  const { scheme } = useAppTheme();
  const c = SPLASH[scheme];
  const [visible, setVisible] = useState(true);

  const wave = useSharedValue(0);
  const word = useSharedValue(0);
  const exit = useSharedValue(0);

  useEffect(() => {
    if (!ready) return;
    wave.set(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.cubic) }));
    word.set(withDelay(250, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })));
    exit.set(
      withDelay(
        1250,
        withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) }, (done) => {
          if (done) scheduleOnRN(setVisible, false);
        }),
      ),
    );
  }, [ready, wave, word, exit]);

  const container = useAnimatedStyle(() => ({ opacity: 1 - exit.value }));
  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + exit.value * 0.18 }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.value * (1 - exit.value),
    transform: [{ translateY: (1 - word.value) * 8 }],
  }));

  if (!visible) return null;

  const { bubble: b, offset } = MARK;

  return (
    <Animated.View
      pointerEvents={ready ? 'none' : 'auto'}
      style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: c.bg, zIndex: 100 }, container]}>
      <Animated.View style={markStyle}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${MARK.box} ${MARK.box}`}>
          <G transform={`translate(${offset.x} ${offset.y})`}>
            <Circle cx={b.cx} cy={b.cy} r={b.r} fill={c.bubble} />
            <Path d={MARK.tail} fill={c.bubble} />
            {MARK.bars.map((_, i) => (
              <Bar key={i} index={i} wave={wave} color={i === 2 ? c.accent : c.bg} />
            ))}
          </G>
        </Svg>
      </Animated.View>
      <View style={styles.wordWrap}>
        <Animated.View style={wordStyle}>
          <Text
            weight="semibold"
            className="text-[22px] tracking-[-0.5px]"
            style={{ color: c.bubble }}>
            zentalk
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  wordWrap: { position: 'absolute', top: '50%', marginTop: SIZE / 2 + 22 },
});
