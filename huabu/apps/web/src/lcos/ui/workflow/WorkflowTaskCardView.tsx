import { motion, useReducedMotion } from 'motion/react';

import { PRESENTATION_EXIT, PRESENTATION_SPRING, presentationPose } from '../spatial/presentationMotion';
import { PreviewMedia } from '../spatial/PreviewMedia';
import { useDescendantFocus } from '../spatial/useDescendantFocus';
import flowIcon from './assets/workflow-flow-23.svg';
import chevronIcon from './assets/workflow-use-chevron.svg';
import paperclipIcon from './assets/workflow-use-paperclip.svg';
import './workflow-hand.css';

export type WorkflowTaskCardVisualState =
  | '静息'
  | '悬停'
  | '预览'
  | '已选目标'
  | '草稿中'
  | '不可用'
  | '键盘焦点';

export interface WorkflowTaskCardViewProps {
  readonly title: string;
  readonly summary?: string;
  readonly disabledReason?: string;
  readonly previewUrl?: string;
  readonly state: WorkflowTaskCardVisualState;
  readonly onUse?: () => void;
  /** Single pointer activation only changes local preview presentation. */
  readonly onPreview?: () => void;
  /** Double click / Enter delegates navigation to the canonical target owner. */
  readonly onEnter?: () => void;
  readonly entryHint?: string;
  /** Honest target state; onEnter may still exist to surface a fail-close reason. */
  readonly entryAvailable?: boolean;
  readonly dataSource?: string;
  readonly dataEntity?: string;
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
  const actionAllowed = onUse !== undefined && !disabled;
  const previewAllowed = onPreview !== undefined && !disabled;
  const enterAllowed = onEnter !== undefined && !disabled;
  const secondary =
    state === '草稿中'
      ? '已加入草稿 · 未发送'
      : disabled
        ? disabledReason ?? '当前不可用'
        : summary ?? '工作流';
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
        <div className="lcos-workflow-task-plate" aria-hidden />
        <div className="lcos-workflow-task-cover">
          <PreviewMedia src={previewUrl} label={`${title} 封面`} />
          <span className="lcos-workflow-task-badge" aria-hidden><img src={flowIcon} alt="" draggable={false} /></span>
          {actionAllowed ? (
            <button
              type="button"
              data-lcos-card-take
              data-lcos-task-take
              {...(dataSource === undefined ? {} : { 'data-lcos-card-source': dataSource })}
              {...(dataEntity === undefined ? {} : { 'data-lcos-card-entity': dataEntity })}
              className="lcos-workflow-task-use"
              onClick={onUse}
            >
              <img src={paperclipIcon} alt="" draggable={false} aria-hidden />
              <span>用于当前会话</span>
              <img src={chevronIcon} alt="" draggable={false} aria-hidden />
            </button>
          ) : null}
        </div>
        <div className="lcos-workflow-task-copy">
          <strong title={title}>{title}</strong>
          <span title={secondary}>{secondary}</span>
        </div>
      </motion.article>
    </div>
  );
}
