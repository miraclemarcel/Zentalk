import { useEffect, useState } from 'react';

import { useChatStore } from '@/stores/chat-store';
import { useSettingsStore } from '@/stores/settings-store';

const allHydrated = () =>
  useSettingsStore.persist.hasHydrated() && useChatStore.persist.hasHydrated();

/** True once every persisted Zustand store has loaded from storage. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(allHydrated);

  useEffect(() => {
    const check = () => setHydrated(allHydrated());
    const unsubs = [
      useSettingsStore.persist.onFinishHydration(check),
      useChatStore.persist.onFinishHydration(check),
    ];
    check();
    return () => unsubs.forEach((u) => u());
  }, []);

  return hydrated;
}
