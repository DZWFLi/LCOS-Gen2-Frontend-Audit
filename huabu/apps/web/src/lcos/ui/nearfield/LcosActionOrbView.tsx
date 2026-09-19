import {
  ACTION_ARC_HIT_INSET,
  ACTION_ARC_HIT_SIZE,
  ACTION_ARC_VISUAL_SIZE,
} from '../../navigation/actionArcGeometry';
import './nearfield.css';

import type { ActionArcPoint } from '../../navigation/actionArcGeometry';
import type { JSX, ReactNode } from 'react';

export interface LcosActionOrbViewProps {
  /** Existing Arc geometry owns this point; the View never positions the overlay. */
  readonly point: ActionArcPoint;
  readonly label: string;
  readonly actionId?: string | undefined;
  readonly more?: boolean | undefined;
  readonly disabledReason?: string | undefined;
  readonly expanded?: boolean | undefined;
  readonly selected?: boolean | undefined;
  readonly onClick: () => void;
  readonly children: ReactNode;
}

/** Thin extraction of the current orb; Gen1 ObjectOrbit capability/label grammar retained. */
export function LcosActionOrbView({
  point, label, actionId, more, disabledReason, expanded, selected, onClick, children,
}: LcosActionOrbViewProps): JSX.Element {
  return (
    <button
      type="button"
      className="lcos-action-orb-hit"
      data-lcos-action-orb-hit
      data-lcos-arc-primary={more ? undefined : actionId}
      data-lcos-arc-more={more || undefined}
      data-ui-selected={selected || undefined}
      aria-label={label}
      aria-expanded={expanded}
      aria-pressed={selected}
      disabled={disabledReason !== undefined}
      title={disabledReason ?? label}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: point.x - ACTION_ARC_HIT_INSET,
        top: point.y - ACTION_ARC_HIT_INSET,
        width: ACTION_ARC_HIT_SIZE,
        height: ACTION_ARC_HIT_SIZE,
      }}
    >
      <span
        className="lcos-action-orb-face"
        data-lcos-action-orb
        style={{ width: ACTION_ARC_VISUAL_SIZE, height: ACTION_ARC_VISUAL_SIZE }}
      >
        {children}
      </span>
      <span className="lcos-action-orb-label" aria-hidden="true">{label}</span>
    </button>
  );
}
