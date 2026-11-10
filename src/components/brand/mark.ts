/** Shared geometry for the Zentalk mark (640×640 box) — same as the app icon. */
export const MARK = {
  box: 640,
  offset: { x: -15, y: 2 },
  bubble: { cx: 340, cy: 300, r: 290 },
  tail: 'M128 430 Q112 566 40 626 Q176 616 262 560 Z',
  bars: [130, 240, 340, 220, 140],
  barWidth: 54,
  gap: 30,
} as const;

export const barX = (i: number) =>
  MARK.bubble.cx -
  (MARK.bars.length * MARK.barWidth + (MARK.bars.length - 1) * MARK.gap) / 2 +
  i * (MARK.barWidth + MARK.gap);
