import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { fisheye1d, temporalTickLength } from './temporalFisheye';
import {
  nextEnabledTemporalIndex,
  temporalRatioToY,
  temporalTickCount,
  TEMPORAL_BOTTOM_PADDING,
  TEMPORAL_MAX_RAIL_HEIGHT,
  TEMPORAL_TICK_STEP,
  TEMPORAL_TOP_PADDING,
} from './temporalNavigation';
import { bindTemporalWheel } from './temporalWheel';
import './context-spatial.css';

export interface TemporalRailItemView {
  readonly id: string;
  readonly label: string;
  /** Position inside the current producer-owned time window, not a timestamp. */
  readonly ratio: number;
  readonly disabled?: boolean;
}

/** Presentation states only. This is not a Core event or episode schema. */
export type TemporalRailVisualState = 'ready' | 'loading' | 'empty' | 'error' | 'recovery';

export interface TemporalRailViewProps {
  readonly items: readonly TemporalRailItemView[];
  readonly activeId?: string;
  readonly reason?: string;
  readonly state?: TemporalRailVisualState;
  /** Change this when the existing owner replaces the worksite or time window. */
  readonly scopeKey?: string;
  readonly onActivate?: (item: TemporalRailItemView) => void;
  readonly onWindowShift?: (direction: -1 | 1) => void;
  readonly onPreviewChange?: (item: TemporalRailItemView | null) => void;
  readonly onRetry?: () => void;
}

const STATE_COPY: Readonly<Record<TemporalRailVisualState, string>> = {
  ready: '', loading: '正在读取时间记录…', empty: '暂无时间记录',
  error: '时间记录读取失败', recovery: '部分目标尚未恢复',
};

export function TemporalRailView({
  items, activeId, reason, state, scopeKey, onActivate, onWindowShift, onPreviewChange, onRetry,
}: TemporalRailViewProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const railRef = useRef<HTMLElement>(null);
  const setRailRef = (node: HTMLElement | null): void => { railRef.current = node; };
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const [railHeight, setRailHeight] = useState(TEMPORAL_MAX_RAIL_HEIGHT);
  const [focusY, setFocusY] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const previewNotifier = useRef<typeof onPreviewChange>(undefined);
  const [rovingId, setRovingId] = useState<string | null>(null);
  const callbacks = useRef({ onPreviewChange, onWindowShift });
  useLayoutEffect(() => { callbacks.current = { onPreviewChange, onWindowShift }; });
  const sorted = useMemo(
    () => items.filter((item) => Number.isFinite(item.ratio)).slice().sort((a, b) => a.ratio - b.ratio),
    [items],
  );
  const unavailablePositions = items.length - sorted.length;
  const visualState = state ?? (sorted.length > 0 ? 'ready' : 'empty');
  const enabled = sorted.filter((item) => item.disabled !== true);
  const tabId = enabled.find((item) => item.id === rovingId)?.id
    ?? enabled.find((item) => item.id === activeId)?.id ?? enabled[0]?.id;
  const previewItem = sorted.find((item) => item.id === previewId && item.disabled !== true) ?? null;

  const setPreview = (item: TemporalRailItemView | null): void => {
    const id = item?.id ?? null;
    if (previewRef.current === id) return;
    previewRef.current = id;
    setPreviewId(id);
    const notify = item === null ? previewNotifier.current : callbacks.current.onPreviewChange;
    previewNotifier.current = item === null ? undefined : notify;
    notify?.(item);
  };

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (rail === null) return;
    const publish = (): void => setRailHeight(Math.min(TEMPORAL_MAX_RAIL_HEIGHT, Math.max(0, rail.clientHeight)));
    publish();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(publish) : null;
    observer?.observe(rail);
    return () => observer?.disconnect();
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (rail === null) return;
    // Keep wheel local even while the producer is unavailable. Never zoom the host.
    return bindTemporalWheel(rail, (direction) => callbacks.current.onWindowShift?.(direction));
  }, []);

  useEffect(() => {
    if (previewRef.current === null) return;
    if (sorted.some((item) => item.id === previewRef.current && item.disabled !== true)) return;
    previewRef.current = null;
    setPreviewId(null);
    setFocusY(null);
    previewNotifier.current?.(null);
    previewNotifier.current = undefined;
  }, [sorted]);

  useEffect(() => {
    setRovingId(null);
    setFocusY(null);
    setPreviewId(null);
    previewRef.current = null;
    return () => {
      if (previewRef.current !== null) previewNotifier.current?.(null);
      previewNotifier.current = undefined;
      previewRef.current = null;
    };
  }, [scopeKey]);

  const message = reason ?? STATE_COPY[visualState];
  if (sorted.length === 0) {
    return (
      <aside
        ref={setRailRef}
        data-lcos-temporal-rail
        data-temporal-state={visualState}
        className="lcos-temporal-rail"
        aria-label="局部时间轨"
        aria-busy={visualState === 'loading' || undefined}
      >
        {message || unavailablePositions > 0 ? <div className="lcos-temporal-feedback" role="status">
          {message ? <span>{message}</span> : null}
          {unavailablePositions > 0 ? <span>{unavailablePositions} 组时间位置不可用</span> : null}
          {(visualState === 'error' || visualState === 'recovery') && onRetry
            ? <button type="button" onClick={onRetry}>重试</button> : null}
        </div> : null}
      </aside>
    );
  }
  return (
    <div
      role="slider"
      ref={setRailRef}
      data-lcos-temporal-rail
      data-temporal-state={visualState}
      className="lcos-temporal-rail"
      aria-label="局部时间轨"
      aria-busy={visualState === 'loading' || undefined}
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={railHeight}
      aria-valuenow={focusY ?? 0}
      tabIndex={enabled.length === 0 ? 0 : -1}
      onPointerMove={(event) => {
        if (reducedMotion || sorted.length === 0) return;
        const rect = event.currentTarget.getBoundingClientRect();
        setFocusY(Math.max(TEMPORAL_TOP_PADDING, Math.min(railHeight - TEMPORAL_BOTTOM_PADDING, event.clientY - rect.top)));
      }}
      onPointerLeave={() => {
        setFocusY(null);
        if (!railRef.current?.contains(document.activeElement)) setPreview(null);
      }}
      onBlurCapture={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        setFocusY(null);
        setPreview(null);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          // Consume only our local preview; a second Esc can reach the existing owner.
          if (previewRef.current === null && focusY === null) return;
          event.preventDefault();
          event.stopPropagation();
          setFocusY(null);
          setPreview(null);
          return;
        }
        // Native button Enter/Space is the only activation path. Do not replay it here.
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        if (enabled.length === 0) return;
        event.preventDefault();
        event.stopPropagation();
        const current = previewRef.current ?? rovingId ?? activeId;
        const index = sorted.findIndex((item) => item.id === current);
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const next = nextEnabledTemporalIndex(sorted, index >= 0 ? index : direction === 1 ? -1 : 0, direction);
        const item = sorted[next];
        if (item === undefined) return;
        setRovingId(item.id);
        setPreview(item);
        if (!reducedMotion) setFocusY(temporalRatioToY(item.ratio, railHeight));
        buttons.current.get(item.id)?.focus({ preventScroll: true });
      }}
    >
      {sorted.length > 0 ? <div className="lcos-temporal-ticks" aria-hidden>
        {Array.from({ length: temporalTickCount(railHeight) }, (_, index) => {
          const baseY = TEMPORAL_TOP_PADDING + index * TEMPORAL_TICK_STEP;
          const y = focusY === null || reducedMotion ? baseY : fisheye1d({
            value: baseY, focus: focusY, min: TEMPORAL_TOP_PADDING,
            max: Math.max(TEMPORAL_TOP_PADDING, railHeight - TEMPORAL_BOTTOM_PADDING), distortion: 3,
          });
          return <i key={index} style={{ top: y, width: temporalTickLength(index) }} />;
        })}
      </div> : null}
      {sorted.map((item) => {
        const baseY = temporalRatioToY(item.ratio, railHeight);
        const y = focusY === null || reducedMotion ? baseY : fisheye1d({
          value: baseY, focus: focusY, min: TEMPORAL_TOP_PADDING,
          max: Math.max(TEMPORAL_TOP_PADDING, railHeight - TEMPORAL_BOTTOM_PADDING), distortion: 3,
        });
        const preview = previewItem?.id === item.id;
        return <motion.button
          key={item.id}
          ref={(node) => { if (node) buttons.current.set(item.id, node); else buttons.current.delete(item.id); }}
          type="button"
          data-temporal-item={item.id}
          data-active={activeId === item.id ? 'true' : undefined}
          data-preview={preview ? 'true' : undefined}
          disabled={item.disabled}
          tabIndex={item.id === tabId ? 0 : -1}
          className="lcos-temporal-item"
          style={{ top: y - 12 }}
          animate={{ x: !reducedMotion && preview ? -12 : 0, scale: !reducedMotion && preview ? 1.1 : 1 }}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 25 }}
          onPointerEnter={() => { if (item.disabled !== true) setPreview(item); }}
          onFocus={() => { setRovingId(item.id); setPreview(item); }}
          onClick={() => { if (item.disabled !== true) onActivate?.(item); }}
          aria-label={item.label}
          aria-current={activeId === item.id ? 'true' : undefined}
        ><i aria-hidden /><span>{item.label}</span></motion.button>;
      })}
      {message || unavailablePositions > 0 ? <div className="lcos-temporal-feedback" role="status">
        {message ? <span>{message}</span> : null}
        {unavailablePositions > 0 ? <span>{unavailablePositions} 组时间位置不可用</span> : null}
        {(visualState === 'error' || visualState === 'recovery') && onRetry
          ? <button type="button" onClick={onRetry}>重试</button> : null}
      </div> : null}
    </div>
  );
}
