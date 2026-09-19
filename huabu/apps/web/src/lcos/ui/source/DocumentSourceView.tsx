import { SourceFeedbackSlot } from './SourceFeedbackSlot';
import { FIGMA_SOURCE_NODE_IDS } from '../../nodes/source/sourceFigmaGeometry';
import './source-presentation.css';

import type { SourceVisualProps } from './sourceViewTypes';
import type { JSX } from 'react';

export function DocumentSourceView(props: SourceVisualProps): JSX.Element {
  const isMark = props.density === 'mark';
  return (
    <div className="lcos-source-view lcos-source-document"
      data-lcos-source-visual="document"
      data-figma-node-id={FIGMA_SOURCE_NODE_IDS.document}
      data-density={props.density}
      data-ui-interaction={props.interaction}
    >
      <div className="lcos-source-paper">
        <span className="lcos-document-title">{props.title}</span>
        {!isMark && <span data-lcos-node-preview className="lcos-document-excerpt">{props.preview}</span>}
        {!isMark && <span className="lcos-document-source">{props.secondary || '文档 · 只读投影'}</span>}
      </div>
      <SourceFeedbackSlot feedback={props.feedback} />
    </div>
  );
}
