import { motion, useReducedMotion } from 'motion/react';
import { useMemo, useState } from 'react';

import { fisheye1d, temporalTickLength } from './temporalFisheye';
import './context-spatial.css';

export interface TemporalRailItemView {
  readonly id: string;
  readonly label: string;
  readonly ratio: number;
  readonly disabled?: boolean;
}

export interface TemporalRailViewProps {
  readonly items: readonly TemporalRailItemView[];
  readonly activeId?: string;
  readonly reason?: string;
  readonly onActivate?: (item: TemporalRailItemView) => void;
  readonly onWindowShift?: (direction: -1 | 1) => void;
}

const RAIL_HEIGHT = 555;
const TOP_PADDING = 13;
const BOTTOM_PADDING = 36;

export function TemporalRailView({ items, activeId, reason, onActivate, onWindowShift }: TemporalRailViewProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const [focusY, setFocusY] = useState<number | null>(null);
  const sorted = useMemo(() => [...items].sort((a, b) => a.ratio - b.ratio), [items]);
  const usable = RAIL_HEIGHT - TOP_PADDING - BOTTOM_PADDING;

  if (sorted.length === 0) {
    return (
      <aside data-lcos-temporal-rail data-temporal-state="empty" className="lcos-temporal-rail" aria-label="局部时间轨">
        <div className="lcos-temporal-empty-mark" aria-hidden />
        <span className="lcos-temporal-empty-copy">{reason ?? '暂无时间记录'}</span>
      </aside>
    );
  }

  return (
    <div
      data-lcos-temporal-rail
      data-temporal-state="ready"
      className="lcos-temporal-rail"
      aria-label="局部时间轨"
      role="slider"
      aria-orientation="vertical"
      aria-valuemin={TOP_PADDING}
      aria-valuemax={RAIL_HEIGHT - BOTTOM_PADDING}
      aria-valuenow={focusY ?? TOP_PADDING}
      tabIndex={0}
      onPointerMove={(event) => {
        if (reducedMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        setFocusY(Math.max(TOP_PADDING, Math.min(RAIL_HEIGHT - BOTTOM_PADDING, event.clientY - rect.top)));
      }}
      onPointerLeave={() => setFocusY(null)}
      onWheel={(event) => {
        if (!onWindowShift || event.deltaY === 0) return;
        event.preventDefault();
        onWindowShift(event.deltaY > 0 ? 1 : -1);
      }}
      onKeyDown={(event) => {
        if (!onWindowShift) return;
        if (event.key === 'ArrowDown') { event.preventDefault(); onWindowShift(1); }
        if (event.key === 'ArrowUp') { event.preventDefault(); onWindowShift(-1); }
      }}
    >
      <div className="lcos-temporal-ticks" aria-hidden>
        {Array.from({ length: 47 }, (_, index) => {
          const baseY = TOP_PADDING + index * 11;
          const y = focusY === null || reducedMotion
            ? baseY
            : fisheye1d({ value: baseY, focus: focusY, min: TOP_PADDING, max: RAIL_HEIGHT - BOTTOM_PADDING, distortion: 3 });
          return <i key={index} style={{ top: y, width: temporalTickLength(index) }} />;
        })}
      </div>
      {sorted.map((item) => {
        const baseY = TOP_PADDING + Math.max(0, Math.min(1, item.ratio)) * usable;
        const y = focusY === null || reducedMotion
          ? baseY
          : fisheye1d({ value: baseY, focus: focusY, min: TOP_PADDING, max: RAIL_HEIGHT - BOTTOM_PADDING, distortion: 3 });
        const near = focusY !== null && Math.abs(y - focusY) < 42;
        return (
          <motion.button
            key={item.id}
            type="button"
            data-temporal-item={item.id}
            data-active={activeId === item.id ? 'true' : undefined}
            disabled={item.disabled}
            className="lcos-temporal-item"
            style={{ top: y }}
            animate={reducedMotion ? undefined : { x: near ? -10 : 0, scale: near ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30, mass: 0.55 }}
            onClick={() => onActivate?.(item)}
            title={item.label}
          >
            <span>{item.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
