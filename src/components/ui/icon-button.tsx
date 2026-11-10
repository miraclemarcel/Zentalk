import type { LucideIcon } from 'lucide-react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { useHaptics } from '@/hooks/use-haptics';

import { PressableScale } from './pressable-scale';

interface Props {
  icon: LucideIcon;
  onPress?: () => void;
  variant?: 'ghost' | 'surface' | 'inverse' | 'accent';
  size?: number;
  iconSize?: number;
  accessibilityLabel: string;
  disabled?: boolean;
}

const containers = {
  ghost: '',
  surface: 'bg-surface border border-line',
  inverse: 'bg-ink',
  accent: 'bg-accent',
};

export function IconButton({
  icon: Icon,
  onPress,
  variant = 'ghost',
  size = 40,
  iconSize = 20,
  accessibilityLabel,
  disabled,
}: Props) {
  const { colors } = useAppTheme();
  const { tap } = useHaptics();
  const color =
    variant === 'inverse' ? colors.bg : variant === 'accent' ? colors['on-accent'] : colors.ink;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={6}
      onPress={() => {
        tap();
        onPress?.();
      }}
      className={`items-center justify-center rounded-full ${containers[variant]} ${disabled ? 'opacity-40' : ''}`}
      style={{ width: size, height: size }}>
      <Icon size={iconSize} color={color} strokeWidth={1.9} />
    </PressableScale>
  );
}
