import { useHaptics } from '@/hooks/use-haptics';

import { PressableScale } from './pressable-scale';
import { Text } from './text';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onPress, variant = 'primary' }: Props) {
  const { press } = useHaptics();
  const primary = variant === 'primary';
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={() => {
        press();
        onPress();
      }}
      className={`h-14 items-center justify-center rounded-full ${primary ? 'bg-ink' : 'border border-line bg-surface'}`}>
      <Text weight="semibold" tone={primary ? 'bg' : 'ink'} className="text-[16px]">
        {label}
      </Text>
    </PressableScale>
  );
}
