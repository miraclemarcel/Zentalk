import { Text as RNText, type TextProps } from 'react-native';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';
type Tone = 'ink' | 'muted' | 'subtle' | 'accent' | 'bg' | 'danger' | 'on-accent';

const weights: Record<Weight, string> = {
  regular: 'font-inter',
  medium: 'font-inter-medium',
  semibold: 'font-inter-semibold',
  bold: 'font-inter-bold',
};

const tones: Record<Tone, string> = {
  ink: 'text-ink',
  muted: 'text-muted',
  subtle: 'text-subtle',
  accent: 'text-accent',
  bg: 'text-bg',
  danger: 'text-danger',
  'on-accent': 'text-on-accent',
};

export interface AppTextProps extends TextProps {
  weight?: Weight;
  tone?: Tone;
  className?: string;
}

export function Text({ weight = 'regular', tone = 'ink', className = '', ...rest }: AppTextProps) {
  return <RNText className={`${weights[weight]} ${tones[tone]} ${className}`} {...rest} />;
}
