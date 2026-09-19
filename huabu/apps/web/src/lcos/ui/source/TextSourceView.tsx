import { SourceFeedbackSlot } from './SourceFeedbackSlot';
import { FIGMA_SOURCE_NODE_IDS } from '../../nodes/source/sourceFigmaGeometry';
import { SourceMarker } from '../../nodes/source/SourceMarker';
import './source-presentation.css';

import type { SourceVisualProps } from './sourceViewTypes';
import type { JSX } from 'react';

export function TextSourceView(props: SourceVisualProps): JSX.Element {
  const isMark = props.density === 'mark';
  const statement = props.preview?.trim() || props.title;
  return (
    <div className="lcos-source-view lcos-source-text"
      data-lcos-source-visual="text"
      data-figma-node-id={FIGMA_SOURCE_NODE_IDS.text}
      data-density={props.density}
      data-ui-interaction={props.interaction}
    >
      <span data-lcos-node-preview className="lcos-source-statement">{statement}</span>
      {!isMark && <span className="lcos-source-caption">{props.secondary || props.title}</span>}
      <SourceMarker size={11} tone="green" right={0} top={3} />
      <SourceFeedbackSlot feedback={props.feedback} />
    </div>
  );
}
