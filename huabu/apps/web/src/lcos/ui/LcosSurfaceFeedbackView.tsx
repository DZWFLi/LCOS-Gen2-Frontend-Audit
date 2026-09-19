// Figma 5391:357；七态是视觉输入，不是新的业务状态。
import { FigmaShellGlyph } from './FigmaShellGlyph';
import { LcosButton } from './primitives/LcosButton';

import type { LcosFeedbackPresentation } from './LcosSurfaceFeedback';
import type { CSSProperties } from 'react';

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
      {onAction && <LcosButton type="button" data-lcos-feedback-action disabled={actionDisabled}
        onClick={onAction}>{actionLabel}</LcosButton>}
    </div>
  );
}
