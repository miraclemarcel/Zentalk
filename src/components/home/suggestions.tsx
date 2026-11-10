import { CalendarDays, Lightbulb, type LucideIcon, Moon, PenLine } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useHaptics } from '@/hooks/use-haptics';

export const SUGGESTIONS: { icon: LucideIcon; title: string; prompt: string }[] = [
  { icon: CalendarDays, title: 'Plan a calm morning', prompt: 'Help me plan a calm, productive morning routine' },
  { icon: PenLine, title: 'Beat procrastination', prompt: "I keep procrastinating on a big project. How do I get started?" },
  { icon: Lightbulb, title: 'Explain it simply', prompt: 'Explain how noise cancelling headphones work, simply' },
  { icon: Moon, title: 'Wind down for sleep', prompt: "What's a good way to wind down before sleep?" },
];

export function Suggestions({ onPick, layout = 'row' }: { onPick: (prompt: string) => void; layout?: 'row' | 'grid' }) {
  const { colors } = useAppTheme();
  const { tap } = useHaptics();

  const cards = SUGGESTIONS.map(({ icon: Icon, title, prompt }) => (
    <PressableScale
      key={title}
      onPress={() => {
        tap();
        onPick(prompt);
      }}
      className={`justify-between rounded-3xl border border-line bg-surface p-4 ${layout === 'row' ? 'h-[124px] w-[148px]' : 'h-[108px] w-[48%]'}`}>
      <Icon size={20} color={colors.ink} strokeWidth={1.7} />
      <Text weight="medium" className="text-[14px] leading-[19px]">
        {title}
      </Text>
    </PressableScale>
  ));

  if (layout === 'grid') return <View className="flex-row flex-wrap justify-between gap-y-3">{cards}</View>;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 px-5">
      {cards}
    </ScrollView>
  );
}
