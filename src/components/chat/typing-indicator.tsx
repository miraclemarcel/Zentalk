import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

function Dot({ delay }: { delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) }),
          ),
          -1,
        ),
      ),
    );
  }, [delay, v]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + v.value * 0.7,
    transform: [{ translateY: -v.value * 3 }],
  }));
  return <Animated.View className="h-[7px] w-[7px] rounded-full bg-muted" style={style} />;
}

export function TypingIndicator() {
  return (
    <View className="h-6 flex-row items-center gap-1.5">
      <Dot delay={0} />
      <Dot delay={140} />
      <Dot delay={280} />
    </View>
  );
}
