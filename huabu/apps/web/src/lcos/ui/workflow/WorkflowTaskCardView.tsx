import { motion, useReducedMotion } from 'motion/react';

import { WorkflowTaskCardFace, workflowTaskSecondary } from './WorkflowTaskCardFace';
import { PRESENTATION_EXIT, PRESENTATION_SPRING, presentationPose } from '../spatial/presentationMotion';
import { useDescendantFocus } from '../spatial/useDescendantFocus';

import type { WorkflowTaskCardFaceProps } from './WorkflowTaskCardFace';
import './workflow-hand.css';

export type { WorkflowTaskCardVisualState } from './WorkflowTaskCardFace';

export type WorkflowTaskCardViewProps = WorkflowTaskCardFaceProps;

export function WorkflowTaskCardView({
  title,
  summary,
  previewUrl,
  state,
  onUse,
  disabledReason,
  dataSource,
  dataEntity,
}: WorkflowTaskCardViewProps): React.JSX.Element {
  const reducedMotion = Boolean(useReducedMotion());
  const focus = useDescendantFocus();
  const disabled = state === '不可用';
  const secondary = workflowTaskSecondary({title, state, ...(summary === undefined ? {} : {summary}), ...(disabledReason === undefined ? {} : {disabledReason})});
  return (
    <div className="lcos-workflow-task-slot" data-card-state={state} onFocusCapture={focus.onFocusCapture} onBlurCapture={focus.onBlurCapture}>
      <motion.article
        data-lcos-workflow-task-card
        data-state={state}
        className="lcos-workflow-task-card"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-label={`${title} · ${secondary}`}
        initial={reducedMotion ? false : { opacity: 0, y: 112, scale: 0.82 }}
        animate={presentationPose(reducedMotion, focus.focused || state === '键盘焦点', disabled)}
        exit={{ opacity: 0, y: reducedMotion ? 0 : 42, scale: reducedMotion ? 1 : 0.8, transition: reducedMotion ? { duration: 0 } : PRESENTATION_EXIT }}
        whileHover={reducedMotion || disabled ? undefined : { y: -8, scale: 1.025 }}
        transition={reducedMotion ? { duration: 0 } : PRESENTATION_SPRING}
      >
        <WorkflowTaskCardFace {...{title, state}}
          {...(summary === undefined ? {} : {summary})}
          {...(previewUrl === undefined ? {} : {previewUrl})}
          {...(onUse === undefined ? {} : {onUse})}
          {...(disabledReason === undefined ? {} : {disabledReason})}
          {...(dataSource === undefined ? {} : {dataSource})}
          {...(dataEntity === undefined ? {} : {dataEntity})} />
      </motion.article>
    </div>
  );
}
