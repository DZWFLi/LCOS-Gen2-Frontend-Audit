import { Image as ImageIcon } from 'lucide-react';

import { SourceFeedbackSlot } from './SourceFeedbackSlot';
import { FIGMA_SOURCE_GEOMETRY, FIGMA_SOURCE_NODE_IDS } from '../../nodes/source/sourceFigmaGeometry';
import { SourceMarker } from '../../nodes/source/SourceMarker';
import './source-presentation.css';

import type { SourceVisualProps } from './sourceViewTypes';
import type { JSX } from 'react';

export function ImageSourceView(props: SourceVisualProps): JSX.Element {
  // Preserve the current thumbnail rule; this is not a new zoom/LOD threshold.
  const compact = (props.worldWidth ?? FIGMA_SOURCE_GEOMETRY.image.width) <= 240;
  return (
    <div className="lcos-source-view lcos-source-image"
      data-lcos-source-visual="image"
      data-figma-node-id={compact ? FIGMA_SOURCE_NODE_IDS.imageThumbnail : FIGMA_SOURCE_NODE_IDS.image}
      data-density={props.density}
      data-thumbnail={compact || undefined}
      data-ui-interaction={props.interaction}
    >
      <div data-lcos-source-media className="lcos-image-media">
        {props.mediaSrc
          ? <img src={props.mediaSrc} alt={props.title} draggable={false} />
          : <div className="lcos-image-unavailable"><ImageIcon size={28} strokeWidth={1.5} aria-hidden /></div>}
      </div>
      <SourceMarker size={compact ? 9 : 11} tone={compact ? 'green' : 'amber'}
        right={compact ? 0 : -3} top={compact ? -4 : -5} />
      {props.density !== 'mark' && (
        <span className="lcos-source-caption">
          {props.title}{props.secondary ? ` · ${props.secondary}` : ''}
        </span>
      )}
      <SourceFeedbackSlot feedback={props.feedback} />
    </div>
  );
}
