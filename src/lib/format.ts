export const formatDuration = (ms: number) => {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatRelative = (ts: number) => {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'now';
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

/** Resample an amplitude series to exactly `count` bars (peak per bucket). */
export const resample = (samples: number[], count: number) => {
  if (samples.length === 0) return Array.from({ length: count }, () => 0.15);
  return Array.from({ length: count }, (_, i) => {
    const start = Math.floor((i / count) * samples.length);
    const end = Math.max(start + 1, Math.floor(((i + 1) / count) * samples.length));
    let peak = 0;
    for (let j = start; j < end; j++) peak = Math.max(peak, samples[j] ?? 0);
    return Math.max(0.12, peak);
  });
};

export const titleFrom = (text: string) => {
  const words = text.trim().replace(/\s+/g, ' ').split(' ').slice(0, 6).join(' ');
  return words.length > 0 ? words.charAt(0).toUpperCase() + words.slice(1) : 'New chat';
};
