export interface TemporalNavigableItem {
  readonly disabled?: boolean;
}

export const TEMPORAL_MAX_RAIL_HEIGHT = 555;
export const TEMPORAL_TOP_PADDING = 13;
export const TEMPORAL_BOTTOM_PADDING = 36;
export const TEMPORAL_TICK_STEP = 11;
export const TEMPORAL_MAX_TICKS = 47;

export function nextEnabledTemporalIndex(
  items: readonly TemporalNavigableItem[],
  from: number,
  delta: -1 | 1,
): number {
  if (items.length === 0) return -1;
  for (let offset = 1; offset <= items.length; offset += 1) {
    const index = (from + delta * offset + items.length) % items.length;
    if (items[index]?.disabled !== true) return index;
  }
  return -1;
}

export function temporalTickCount(railHeight: number): number {
  return Math.min(
    TEMPORAL_MAX_TICKS,
    Math.max(1, Math.floor((railHeight - TEMPORAL_TOP_PADDING - 1) / TEMPORAL_TICK_STEP)),
  );
}

export function temporalRatioToY(ratio: number, railHeight: number): number {
  const usable = Math.max(1, railHeight - TEMPORAL_TOP_PADDING - TEMPORAL_BOTTOM_PADDING);
  return TEMPORAL_TOP_PADDING + Math.max(0, Math.min(1, ratio)) * usable;
}
