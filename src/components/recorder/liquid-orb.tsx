import {
  Blur,
  BlurMask,
  Canvas,
  Circle,
  ColorMatrix,
  Group,
  LinearGradient,
  Oval,
  Paint,
  Path,
  RadialGradient,
  Skia,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia';
import { type SharedValue, useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';

import { liquid } from '@/theme/palette';

interface Props {
  size: number;
  /** Target loudness 0–1 (raw; smoothed internally). */
  level: SharedValue<number>;
  /** 1 while actively listening, 0 when paused/idle. */
  active: SharedValue<number>;
}

const TAU = Math.PI * 2;
const POINTS = 90;
// Alpha-threshold matrix: blurred shapes snap back to crisp edges and merge like liquid.
const GOO = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 20, -8.5];

/**
 * A glossy, living droplet. Its surface ripples with your voice, satellite droplets
 * drift away and melt back in, and the interior shimmers like light through water.
 */
export function LiquidOrb({ size, level, active }: Props) {
  const c = size / 2;
  const R = size * 0.27;

  const phase = useSharedValue(0);
  const smooth = useSharedValue(0);
  const act = useSharedValue(0);

  useFrameCallback((frame) => {
    const dt = Math.min(0.05, (frame.timeSincePreviousFrame ?? 16) / 1000);
    act.value += (active.value - act.value) * Math.min(1, dt * 4);
    // Fast attack, slow release — feels like liquid catching a breath.
    const k = level.value > smooth.value ? 14 : 4;
    smooth.value += (level.value * act.value - smooth.value) * Math.min(1, dt * k);
    phase.value += dt * (0.55 + act.value * 0.9 + smooth.value * 2.6);
  });

  const blob = useDerivedValue(() => {
    const t = phase.value;
    const L = smooth.value;
    const a = 0.02 + act.value * 0.012 + L * 0.06;
    const base = R * (1 + L * 0.08);
    const p = Skia.PathBuilder.Make();
    for (let i = 0; i <= POINTS; i++) {
      const th = (i / POINTS) * TAU;
      const r =
        base *
        (1 +
          a * Math.sin(3 * th + t * 1.1) +
          a * 0.8 * Math.sin(5 * th - t * 1.6 + 1.3) +
          a * 0.55 * Math.sin(2 * th + t * 0.7 + 2.1) +
          L * 0.02 * Math.sin(9 * th + t * 3.1));
      const x = c + r * Math.cos(th);
      const y = c + r * Math.sin(th);
      if (i === 0) p.moveTo(x, y);
      else p.lineTo(x, y);
    }
    p.close();
    return p.detach();
  });

  const glowOpacity = useDerivedValue(() => 0.35 + act.value * 0.15 + smooth.value * 0.4);
  const sheenTransform = useDerivedValue(() => [{ rotate: phase.value * 0.45 }]);

  // Caustic light pools drifting inside the body.
  const c1x = useDerivedValue(() => c + Math.cos(phase.value * 0.7) * R * 0.45);
  const c1y = useDerivedValue(() => c + Math.sin(phase.value * 0.9) * R * 0.35);
  const c2x = useDerivedValue(() => c + Math.cos(phase.value * 0.5 + 2.4) * R * 0.5);
  const c2y = useDerivedValue(() => c + Math.sin(phase.value * 0.6 + 1.2) * R * 0.45);

  return (
    <Canvas style={{ width: size, height: size }}>
      {/* Ambient glow */}
      <Group opacity={glowOpacity} transform={[{ scale: 1.12 }]} origin={vec(c, c)}>
        <Path path={blob} color={liquid.glow}>
          <BlurMask blur={R * 0.45} style="normal" />
        </Path>
      </Group>

      <Ripple offset={0} c={c} R={R} phase={phase} act={act} level={smooth} />
      <Ripple offset={0.5} c={c} R={R} phase={phase} act={act} level={smooth} />

      {/* Liquid body + droplets, merged */}
      <Group
        layer={
          <Paint>
            <Blur blur={9} />
            <ColorMatrix matrix={GOO} />
          </Paint>
        }>
        <RadialGradient
          c={vec(c - R * 0.35, c - R * 0.45)}
          r={R * 1.75}
          colors={[...liquid.core]}
          positions={[0, 0.32, 0.68, 1]}
        />
        <Path path={blob} />
        <Droplet index={0} c={c} R={R} phase={phase} act={act} level={smooth} />
        <Droplet index={1} c={c} R={R} phase={phase} act={act} level={smooth} />
        <Droplet index={2} c={c} R={R} phase={phase} act={act} level={smooth} />
      </Group>

      {/* Inner light, clipped to the body */}
      <Group clip={blob}>
        <Group transform={sheenTransform} origin={vec(c, c)} blendMode="softLight" opacity={0.75}>
          <Circle cx={c} cy={c} r={R * 1.5}>
            <SweepGradient c={vec(c, c)} colors={[...liquid.sheen]} />
          </Circle>
        </Group>
        <Circle cx={c1x} cy={c1y} r={R * 0.42} color="#9FF0FF" opacity={0.28}>
          <BlurMask blur={R * 0.28} style="normal" />
        </Circle>
        <Circle cx={c2x} cy={c2y} r={R * 0.36} color="#FFB8EE" opacity={0.22}>
          <BlurMask blur={R * 0.26} style="normal" />
        </Circle>
        {/* depth at the base */}
        <Oval x={c - R} y={c + R * 0.25} width={R * 2} height={R * 1.1} color="#140C66" opacity={0.45}>
          <BlurMask blur={R * 0.3} style="normal" />
        </Oval>
        {/* specular gloss */}
        <Group transform={[{ rotate: -0.45 }]} origin={vec(c - R * 0.25, c - R * 0.55)}>
          <Oval x={c - R * 0.72} y={c - R * 0.82} width={R * 0.95} height={R * 0.46}>
            <LinearGradient
              start={vec(0, c - R * 0.82)}
              end={vec(0, c - R * 0.36)}
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0)']}
            />
            <BlurMask blur={3} style="normal" />
          </Oval>
        </Group>
        <Circle cx={c + R * 0.42} cy={c + R * 0.5} r={R * 0.05} color="rgba(255,255,255,0.55)">
          <BlurMask blur={2} style="normal" />
        </Circle>
      </Group>

      {/* glass rim */}
      <Path path={blob} style="stroke" strokeWidth={1.25} color="rgba(255,255,255,0.32)" />
    </Canvas>
  );
}

interface PartProps {
  c: number;
  R: number;
  phase: SharedValue<number>;
  act: SharedValue<number>;
  level: SharedValue<number>;
}

/** A satellite droplet that orbits, drifts out and melts back into the body. */
function Droplet({ index: i, c, R, phase, act, level }: PartProps & { index: number }) {
  const dist = useDerivedValue(
    () =>
      R * (0.9 + 0.36 * (0.5 + 0.5 * Math.sin(phase.value * 0.55 + i * 1.7))) * (1 + level.value * 0.2),
  );
  const ang = useDerivedValue(() => phase.value * (0.32 + i * 0.11) + i * 2.1);
  const cx = useDerivedValue(() => c + Math.cos(ang.value) * dist.value);
  const cy = useDerivedValue(() => c + Math.sin(ang.value) * dist.value);
  const r = useDerivedValue(
    () => R * (0.12 + i * 0.025) * (0.85 + level.value * 0.5 + act.value * 0.15),
  );
  return <Circle cx={cx} cy={cy} r={r} />;
}

/** A ring of light radiating outward while you speak. */
function Ripple({ offset, c, R, phase, act, level }: PartProps & { offset: number }) {
  const p = useDerivedValue(() => (phase.value * 0.28 + offset) % 1);
  const r = useDerivedValue(() => R * (1.08 + p.value * 0.7));
  const o = useDerivedValue(() => (1 - p.value) * (0.05 + act.value * 0.12 + level.value * 0.35));
  return <Circle cx={c} cy={c} r={r} color="#B9B2FF" style="stroke" strokeWidth={1.2} opacity={o} />;
}
