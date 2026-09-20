import { motion, useReducedMotion } from 'motion/react';

import { WorkflowTaskCardFace, workflowTaskSecondary } from './WorkflowTaskCardFace';
import { PRESENTATION_EXIT, PRESENTATION_SPRING, presentationPose } from '../spatial/presentationMotion';
import { useDescendantFocus } from '../spatial/useDescendantFocus';

import type { WorkflowTaskCardFaceProps } from './WorkflowTaskCardFace';
import './workflow-hand.css';

export type { WorkflowTaskCardVisualState } from './WorkflowTaskCardFace';

export interface WorkflowTaskCardViewProps extends WorkflowTaskCardFaceProps {
  /** Single pointer activation only changes local preview presentation. */
  readonly onPreview?: () => void;
  /** Double click / Enter delegates navigation to the canonical target owner. */
  readonly onEnter?: () => void;
  readonly entryHint?: string;
  /** Honest target state; onEnter may still exist to surface a fail-close reason. */
  readonly entryAvailable?: boolean;
  /** Transitional selector for the current production/e2e contract. */
  readonly legacyWorkflowKind?: string;
}

export function WorkflowTaskCardView({
  title,
  summary,
  previewUrl,
  state,
  onUse,
  onPreview,
  onEnter,
  entryHint,
  entryAvailable = false,
  disabledReason,
  dataSource,
  dataEntity,
  legacyWorkflowKind,
}: WorkflowTaskCardViewProps): React.JSX.Element {
  const reducedMotion = Boolean(useReducedMotion());
  const focus = useDescendantFocus();
  const disabled = state === '不可用';
  const previewAllowed = onPreview !== undefined && !disabled;
  const enterAllowed = onEnter !== undefined && !disabled;
  const secondary = workflowTaskSecondary({title, state, ...(summary === undefined ? {} : {summary}), ...(disabledReason === undefined ? {} : {disabledReason})});
  return (
    <div className="lcos-workflow-task-slot" data-card-state={state} onFocusCapture={focus.onFocusCapture} onBlurCapture={focus.onBlurCapture}>
      <motion.article
        data-lcos-family="task-card"
        data-lcos-variant={state}
        {...(legacyWorkflowKind === undefined ? {} : { 'data-lcos-workflow-card': legacyWorkflowKind })}
        data-lcos-workflow-task-card
        data-state={state}
        data-preview={state === '预览' ? 'true' : undefined}
        data-entry-available={entryAvailable ? 'true' : 'false'}
        className="lcos-workflow-task-card"
        tabIndex={disabled ? -1 : 0}
        role="group"
        aria-roledescription="工作流任务卡"
        aria-disabled={disabled || undefined}
        aria-label={`${title} · ${secondary}${entryHint ? ` · ${entryHint}` : ''}`}
        onClick={(event) => {
          if (!previewAllowed) return;
          const target = event.target;
          if (target instanceof Element && target.closest('button,a,input,select,textarea')) return;
          onPreview();
        }}
        onDoubleClick={(event) => {
          if (!enterAllowed) return;
          const target = event.target;
          if (target instanceof Element && target.closest('button,a,input,select,textarea')) return;
          event.preventDefault();
          onEnter();
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || disabled) return;
          if (event.key === 'Enter' && enterAllowed) {
            event.preventDefault();
            onEnter();
          } else if (event.key === ' ' && previewAllowed) {
            event.preventDefault();
            onPreview();
          }
        }}
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
