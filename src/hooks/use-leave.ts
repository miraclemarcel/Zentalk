import { router, useNavigation } from 'expo-router';
import { useCallback } from 'react';

/**
 * Leave the current screen exactly once.
 * Ignored if this screen is no longer focused (double-tap, or a delete racing a back
 * press), which is what otherwise produces "GO_BACK was not handled by any navigator".
 */
export function useLeave() {
  const navigation = useNavigation();
  return useCallback(() => {
    if (!navigation.isFocused()) return;
    if (navigation.canGoBack()) navigation.goBack();
    else router.replace('/');
  }, [navigation]);
}
