import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';

import { LightCurtainBackdrop } from '../spatial/LightCurtainBackdrop';
import { PRESENTATION_EXIT } from '../spatial/presentationMotion';

import './workflow-hand.css';
import type { ReactNode } from 'react';

export interface WorkflowHandViewProps {
  readonly open: boolean;
  readonly header: ReactNode;
  readonly children: ReactNode;
}

function HandLayer({ header, children }: Omit<WorkflowHandViewProps, 'open'>): React.JSX.Element {
  const present = useIsPresent();
  const reduced = Boolean(useReducedMotion());
  return (
    <motion.div
      data-lcos-workflow-hand
      data-presentation-present={present ? 'true' : 'false'}
      className="lcos-workflow-hand-stage"
      role="region"
      aria-label="工作流手牌"
      aria-hidden={!present || undefined}
      inert={!present || undefined}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduced ? { duration: 0 } : PRESENTATION_EXIT}
    >
      <LightCurtainBackdrop kind="hand" />
      <div className="lcos-workflow-hand-shell">
        <div className="lcos-workflow-hand-head">{header}</div>
        {children}
      </div>
    </motion.div>
  );
}

/** GEN1 ObjectOrbit presence pattern: boundary survives the open=false render. */
export function WorkflowHandView({ open, header, children }: WorkflowHandViewProps): React.JSX.Element {
  return (
    <AnimatePresence initial={false} mode="sync">
      {open ? <HandLayer key="workflow-hand" header={header}>{children}</HandLayer> : null}
    </AnimatePresence>
  );
}
