import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { useAppTheme } from '@/hooks/use-app-theme';

import { barX, MARK } from './mark';

interface Props {
  size?: number;
  /** Override colors; defaults follow the active theme. */
  color?: string;
  holeColor?: string;
  accent?: string;
}

/** Static Zentalk mark: speech bubble with a voice waveform. */
export function Logo({ size = 32, color, holeColor, accent }: Props) {
  const { colors } = useAppTheme();
  const bubble = color ?? colors.ink;
  const hole = holeColor ?? colors.bg;
  const mid = accent ?? colors.accent;
  const { bubble: b, offset } = MARK;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${MARK.box} ${MARK.box}`}>
      <G transform={`translate(${offset.x} ${offset.y})`}>
        <Circle cx={b.cx} cy={b.cy} r={b.r} fill={bubble} />
        <Path d={MARK.tail} fill={bubble} />
        {MARK.bars.map((h, i) => (
          <Rect
            key={i}
            x={barX(i)}
            y={b.cy - h / 2}
            width={MARK.barWidth}
            height={h}
            rx={MARK.barWidth / 2}
            fill={i === 2 ? mid : hole}
          />
        ))}
      </G>
    </Svg>
  );
}
