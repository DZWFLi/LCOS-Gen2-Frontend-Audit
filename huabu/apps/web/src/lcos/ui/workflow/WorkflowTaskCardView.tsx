import { ChevronDown, Paperclip, PlaySquare } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import './workflow-hand.css';

export type WorkflowTaskCardVisualState = '静息' | '预览' | '已选目标' | '草稿中' | '不可用';

export interface WorkflowTaskCardViewProps {
  readonly title: string;
  readonly summary?: string;
  readonly previewUrl?: string;
  readonly state: WorkflowTaskCardVisualState;
  readonly onUse?: () => void;
  readonly dataSource?: string;
  readonly dataEntity?: string;
}

export function WorkflowTaskCardView({
  title,
  summary,
  previewUrl,
  state,
  onUse,
  dataSource,
  dataEntity,
}: WorkflowTaskCardViewProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const disabled = state === '不可用';
  const showUse = !disabled && onUse !== undefined;
  return (
    <motion.article
      data-lcos-workflow-task-card
      data-state={state}
      className="lcos-workflow-task-card"
      whileHover={reducedMotion || disabled ? undefined : { y: -8, scale: 1.025 }}
      transition={{ type: 'spring', stiffness: 330, damping: 28, mass: 0.58 }}
    >
      <div className="lcos-workflow-task-cover">
        {previewUrl ? <img src={previewUrl} alt="" draggable={false} /> : <div className="lcos-workflow-task-cover-fallback" />}
        <span className="lcos-workflow-task-badge" aria-hidden><PlaySquare size={23} strokeWidth={1.7} /></span>
        {showUse ? (
          <button
            type="button"
            data-lcos-card-take
            data-lcos-task-take
            {...(dataSource === undefined ? {} : { 'data-lcos-card-source': dataSource })}
            {...(dataEntity === undefined ? {} : { 'data-lcos-card-entity': dataEntity })}
            className="lcos-workflow-task-use"
            onClick={onUse}
          >
            <Paperclip size={16} aria-hidden />
            <span>用于当前会话</span>
            <ChevronDown size={16} aria-hidden />
          </button>
        ) : null}
      </div>
      <div className="lcos-workflow-task-copy">
        <strong>{title}</strong>
        <span>{summary ?? '工作流'}</span>
      </div>
    </motion.article>
  );
}
