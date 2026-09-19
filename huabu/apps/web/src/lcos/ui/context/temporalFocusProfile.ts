import { temporalTickLength } from './temporalFisheye';
import { TEMPORAL_TICK_STEP, TEMPORAL_TOP_PADDING } from './temporalNavigation';

/**
 * Figma 5156:3080 / ticks 5156:3081–3127, focused at tick 24 (y=277).
 * This is a sampled DESIGN KEYFRAME, not an invented time/grouping algorithm.
 * The approved focus keeps every y unchanged and expands leftwards to x=4.
 * Between samples we interpolate their measured widths; the existing Motion
 * runtime handles time interpolation. Do not restore the old vertical d3 warp.
 */
export const TEMPORAL_FOCUS_FALLOFF: readonly number[] = [
  30,
  28.065208435058594,
  22.97784996032715,
  16.4643497467041,
  10.324613571166992,
  5.666268348693848,
  2.721538543701172,
  1.1440000534057617,
  0.4208536148071289,
  0.1354970932006836,
  0.03817939758300781,
  0.0094146728515625,
  0.0020322799682617188,
  0.0003833770751953125,
  6.389617919921875e-05,
  9.5367431640625e-06,
  9.5367431640625e-07,
  0,
];

export function temporalFocusTick(index: number, focusY: number | null, reducedMotion: boolean) {
  const y = TEMPORAL_TOP_PADDING + index * TEMPORAL_TICK_STEP;
  const width = temporalTickLength(index);
  const rest = { width, height: 1, backgroundColor: '#a8b8ac' };
  if (reducedMotion || focusY === null || !Number.isFinite(focusY)) return rest;
  const distance = Math.abs(y - focusY) / TEMPORAL_TICK_STEP;
  const lower = Math.floor(distance);
  const a = TEMPORAL_FOCUS_FALLOFF[lower];
  if (a === undefined) return rest;
  const b = TEMPORAL_FOCUS_FALLOFF[lower + 1] ?? 0;
  const extension = a + (b - a) * (distance - lower);
  const focused = index === Math.max(0, Math.round((focusY - TEMPORAL_TOP_PADDING) / TEMPORAL_TICK_STEP));
  return {
    width: Math.min(44, width + extension),
    height: focused ? 3 : 1,
    backgroundColor: focused ? '#263f30' : '#a8b8ac',
  };
}
