import { motion, useReducedMotion } from 'motion/react';

import flowIcon from './assets/workflow-flow-22.svg';

import type { ReactNode } from 'react';

import './workflow-hand.css';

export type WorkflowCollectionRendition = '工作流现场' | '主画布' | '装配';

export interface WorkflowCollectionViewProps {
  readonly title: string;
  readonly rendition: WorkflowCollectionRendition;
  readonly previewUrl?: string;
  readonly disabled?: boolean;
  readonly active?: boolean;
  readonly action?: ReactNode;
}

export function WorkflowCollectionView({
  title,
  rendition,
  previewUrl,
  disabled = false,
  active = false,
  action,
}: WorkflowCollectionViewProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  return (
    <div
      className="lcos-workflow-collection-slot"
      data-active={active ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
    >
      <motion.div
        data-lcos-workflow-collection
        data-rendition={rendition}
        className="lcos-workflow-collection"
        initial={reducedMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={reducedMotion || disabled ? undefined : { y: -7, scale: 1.022 }}
        whileFocus={reducedMotion || disabled ? undefined : { y: -7, scale: 1.022 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="lcos-workflow-collection-back" aria-hidden />
        <div className="lcos-workflow-collection-cover" aria-hidden>
          {previewUrl ? <img src={previewUrl} alt="" draggable={false} /> : null}
        </div>
        <div className="lcos-workflow-collection-front" aria-hidden />
        <div className="lcos-workflow-collection-spine" aria-hidden />
        <div className="lcos-workflow-collection-tab" aria-hidden />
        <img className="lcos-workflow-collection-icon" src={flowIcon} alt="" draggable={false} />
        <div className="lcos-workflow-collection-copy"><strong>{title}</strong><span>工作流</span></div>
        <div className="lcos-workflow-collection-action">{action ?? <span aria-hidden>↗</span>}</div>
      </motion.div>
    </div>
  );
}
