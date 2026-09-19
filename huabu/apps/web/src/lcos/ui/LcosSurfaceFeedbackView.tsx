// Figma 5391:357；七态是视觉输入，不是新的业务状态。
import { FigmaShellGlyph } from './FigmaShellGlyph';

import type { CSSProperties } from 'react';
import type { LcosFeedbackPresentation } from './LcosSurfaceFeedback';

export interface LcosSurfaceFeedbackViewProps {
  readonly presentation: LcosFeedbackPresentation;
  readonly message: string;
  readonly onAction?: () => void;
  readonly actionLabel?: string;
  readonly actionDisabled?: boolean;
  readonly style?: CSSProperties;
}

export function LcosSurfaceFeedbackView({ presentation, message, onAction,
  actionLabel = '重试', actionDisabled = false, style }: LcosSurfaceFeedbackViewProps): React.JSX.Element {
  return (
    <div role="status" data-lcos-family="surface-feedback" data-lcos-variant={presentation}
      data-lcos-surface-feedback={presentation} style={style}>
      <FigmaShellGlyph name={presentation} size={18} />
      <span data-lcos-feedback-message>{message}</span>
      {onAction && <button type="button" data-lcos-feedback-action disabled={actionDisabled}
        onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
