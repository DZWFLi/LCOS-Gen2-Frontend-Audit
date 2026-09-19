import { motion, useReducedMotion } from 'motion/react';

import { PreviewMedia } from '../spatial/PreviewMedia';
import { useDescendantFocus } from '../spatial/useDescendantFocus';
import flowIcon from './assets/workflow-flow-22.svg';

import type { ReactNode } from 'react';

import './workflow-hand.css';

export type WorkflowCollectionRendition = '工作流现场' | '主画布' | '装配';

export interface WorkflowCollectionViewProps {
  readonly title: string;
  readonly rendition: WorkflowCollectionRendition;
  readonly previewUrl?: string;
  readonly disabled?: boolean;
  readonly disabledReason?: string;
  readonly active?: boolean;
  readonly action?: ReactNode;
}

export function WorkflowCollectionView({
  title,
  rendition,
  previewUrl,
  disabled = false,
  disabledReason,
  active = false,
  action,
}: WorkflowCollectionViewProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const focus = useDescendantFocus();
  return (
    <div
      className="lcos-workflow-collection-slot"
      data-active={active ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-focused={focus.focused ? 'true' : undefined}
      aria-disabled={disabled || undefined}
      onFocusCapture={focus.onFocusCapture}
      onBlurCapture={focus.onBlurCapture}
    >
      <motion.div
        data-lcos-workflow-collection
        data-rendition={rendition}
        className="lcos-workflow-collection"
        initial={reducedMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: !reducedMotion && !disabled && focus.focused ? -7 : 0, scale: !reducedMotion && !disabled && focus.focused ? 1.022 : 1 }}
        whileHover={reducedMotion || disabled ? undefined : { y: -7, scale: 1.022 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="lcos-workflow-collection-back" aria-hidden />
        <div className="lcos-workflow-collection-cover">
          <PreviewMedia src={previewUrl} label={`${title} 封面`} />
        </div>
        <div className="lcos-workflow-collection-front" aria-hidden />
        <div className="lcos-workflow-collection-spine" aria-hidden />
        <div className="lcos-workflow-collection-tab" aria-hidden />
        <img className="lcos-workflow-collection-icon" src={flowIcon} alt="" draggable={false} />
        <div className="lcos-workflow-collection-copy"><strong title={title}>{title}</strong><span title={disabledReason}>{disabled ? disabledReason ?? '目标当前不可用' : '工作流'}</span></div>
        <div className="lcos-workflow-collection-action">{!disabled ? action : null}</div>
      </motion.div>
    </div>
  );
}
