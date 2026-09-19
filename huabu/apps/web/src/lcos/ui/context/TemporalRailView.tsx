import { motion, useReducedMotion } from 'motion/react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { fisheye1d, temporalTickLength } from './temporalFisheye';
import {
  nextEnabledTemporalIndex,
  temporalRatioToY,
  temporalTickCount,
  TEMPORAL_BOTTOM_PADDING,
  TEMPORAL_MAX_RAIL_HEIGHT,
  TEMPORAL_TOP_PADDING,
} from './temporalNavigation';
import './context-spatial.css';

export interface TemporalRailItemView {
  readonly id: string;
  readonly label: string;
  /** Ratio inside the current producer-owned time window, clamped to 0..1. */
  readonly ratio: number;
  readonly disabled?: boolean;
}
export interface TemporalRailViewProps {
  readonly items: readonly TemporalRailItemView[];
  readonly activeId?: string;
  readonly reason?: string;
  readonly onActivate?: (item: TemporalRailItemView) => void;
  /** Wheel shifts only the producer-owned time window; it never changes Canvas camera. */
  readonly onWindowShift?: (direction: -1 | 1) => void;
  readonly onPreviewChange?: (item: TemporalRailItemView | null) => void;
}



export function TemporalRailView({
  items,
  activeId,
  reason,
  onActivate,
  onWindowShift,
  onPreviewChange,
}: TemporalRailViewProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const railRef = useRef<HTMLElement>(null);
  const [railHeight, setRailHeight] = useState(TEMPORAL_MAX_RAIL_HEIGHT);
  const [focusY, setFocusY] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const sorted = useMemo(() => [...items].sort((a, b) => a.ratio - b.ratio), [items]);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (rail === null) return;
    const publish = (): void => setRailHeight(Math.min(TEMPORAL_MAX_RAIL_HEIGHT, Math.max(120, rail.getBoundingClientRect().height)));
    publish();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(publish) : null;
    observer?.observe(rail);
    return () => observer?.disconnect();
  }, []);

  const tickCount = temporalTickCount(railHeight);
  const previewItem = sorted.find((item) => item.id === previewId) ?? null;

  const setPreview = (item: TemporalRailItemView | null): void => {
    setPreviewId(item?.id ?? null);
    onPreviewChange?.(item);
  };

  if (sorted.length === 0) {
    return (
      <aside
        ref={railRef}
        data-lcos-temporal-rail
        data-temporal-state="empty"
        className="lcos-temporal-rail"
        aria-label="局部时间轨"
      >
        <span className="lcos-temporal-empty-copy">{reason ?? '暂无时间记录'}</span>
      </aside>
    );
  }

  return (
    <div
      role="slider"
      ref={railRef}
      data-lcos-temporal-rail
      data-temporal-state="ready"
      className="lcos-temporal-rail"
      aria-label="局部时间轨"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={railHeight}
      aria-valuenow={focusY ?? 0}
      tabIndex={0}
      onPointerMove={(event) => {
        if (reducedMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        setFocusY(Math.max(TEMPORAL_TOP_PADDING, Math.min(railHeight - TEMPORAL_BOTTOM_PADDING, event.clientY - rect.top)));
      }}
      onPointerLeave={() => {
        setFocusY(null);
        setPreview(null);
      }}
      onWheel={(event) => {
        if (!onWindowShift || event.deltaY === 0) return;
        event.preventDefault();
        onWindowShift(event.deltaY > 0 ? 1 : -1);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          setFocusY(null);
          setPreview(null);
          return;
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter') return;
        const currentId = previewId ?? activeId;
        const currentIndex = Math.max(-1, sorted.findIndex((item) => item.id === currentId));
        if (event.key === 'Enter') {
          const item = currentIndex >= 0 ? sorted[currentIndex] : undefined;
          if (item && item.disabled !== true) {
            event.preventDefault();
            onActivate?.(item);
          }
          return;
        }
        event.preventDefault();
        const direction: -1 | 1 = event.key === 'ArrowDown' ? 1 : -1;
        const seed = currentIndex >= 0 ? currentIndex : direction === 1 ? -1 : 0;
        const nextIndex = nextEnabledTemporalIndex(sorted, seed, direction);
        if (nextIndex >= 0) {
          const item = sorted[nextIndex] ?? null;
          setPreview(item);
          if (item) setFocusY(temporalRatioToY(item.ratio, railHeight));
        }
      }}
    >
      <div className="lcos-temporal-ticks" aria-hidden>
        {Array.from({ length: tickCount }, (_, index) => {
          const baseY = TEMPORAL_TOP_PADDING + index * 11;
          const y = focusY === null || reducedMotion
            ? baseY
            : fisheye1d({ value: baseY, focus: focusY, min: TEMPORAL_TOP_PADDING, max: railHeight - TEMPORAL_BOTTOM_PADDING, distortion: 3 });
          return <i key={index} style={{ top: y, width: temporalTickLength(index) }} />;
        })}
      </div>
      {sorted.map((item) => {
        const baseY = temporalRatioToY(item.ratio, railHeight);
        const y = focusY === null || reducedMotion
          ? baseY
          : fisheye1d({ value: baseY, focus: focusY, min: TEMPORAL_TOP_PADDING, max: railHeight - TEMPORAL_BOTTOM_PADDING, distortion: 3 });
        const preview = previewItem?.id === item.id;
        const active = activeId === item.id;
        return (
          <motion.button
            key={item.id}
            type="button"
            data-temporal-item={item.id}
            data-active={active ? 'true' : undefined}
            data-preview={preview ? 'true' : undefined}
            disabled={item.disabled}
            className="lcos-temporal-item"
            style={{ top: y }}
            animate={reducedMotion ? undefined : { x: preview ? -12 : 0, scale: preview ? 1.1 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onPointerEnter={() => setPreview(item)}
            onFocus={() => setPreview(item)}
            onClick={() => onActivate?.(item)}
            aria-label={item.label}
          >
            <i aria-hidden />
            <span>{item.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
