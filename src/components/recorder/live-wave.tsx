import { Canvas, Group, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia';

import { liquid } from '@/theme/palette';

interface Props {
  samples: number[];
  width: number;
  height?: number;
  bars?: number;
}

/** Scrolling live waveform — newest sample on the right, older ones fading out left. */
export function LiveWave({ samples, width, height = 44, bars = 42 }: Props) {
  const gap = 3;
  const barW = (width - gap * (bars - 1)) / bars;
  const recent = samples.slice(-bars);
  const padded = Array.from({ length: bars - recent.length }, () => 0).concat(recent);

  return (
    <Canvas style={{ width, height }}>
      <Group>
        <LinearGradient start={vec(0, 0)} end={vec(width, 0)} colors={[...liquid.sheen]} />
        {padded.map((v, i) => {
          const h = Math.max(3, v * height);
          const fade = 0.15 + 0.85 * (i / (bars - 1));
          return (
            <RoundedRect
              key={i}
              x={i * (barW + gap)}
              y={(height - h) / 2}
              width={barW}
              height={h}
              r={barW / 2}
              opacity={fade}
            />
          );
        })}
      </Group>
    </Canvas>
  );
}
