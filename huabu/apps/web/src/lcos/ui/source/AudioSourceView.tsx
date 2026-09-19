import { SourceFeedbackSlot } from './SourceFeedbackSlot';
import {
  FIGMA_AUDIO_ACTIVE_BAR_COUNT,
  FIGMA_AUDIO_BAR_HEIGHTS,
  FIGMA_AUDIO_USED_WIDTH,
  FIGMA_SOURCE_GEOMETRY,
  FIGMA_SOURCE_NODE_IDS,
} from '../../nodes/source/sourceFigmaGeometry';
import './source-presentation.css';

import type { SourceVisualProps } from './sourceViewTypes';
import type { JSX, ReactNode } from 'react';

export function AudioSourceView(props: SourceVisualProps & {
  readonly durationText?: string | undefined;
  readonly mediaMetadata?: ReactNode;
}): JSX.Element {
  return (
    <div className="lcos-source-view lcos-source-audio"
      data-lcos-source-visual="audio"
      data-figma-node-id={FIGMA_SOURCE_NODE_IDS.audio}
      data-density={props.density}
      data-ui-interaction={props.interaction}
    >
      <div data-lcos-waveform="exact" data-waveform-source="figma-decorative"
        aria-hidden="true" className="lcos-audio-wave"
        style={{ width: FIGMA_AUDIO_USED_WIDTH, columnGap: FIGMA_SOURCE_GEOMETRY.audio.barGap }}>
        {FIGMA_AUDIO_BAR_HEIGHTS.map((height, index) => (
          <span key={index} data-lcos-wave-bar
            data-wave-tone={index < FIGMA_AUDIO_ACTIVE_BAR_COUNT ? 'leading' : 'trailing'}
            style={{ height }} />
        ))}
      </div>
      {props.mediaMetadata}
      {props.density !== 'mark' && (
        <span className="lcos-source-caption">
          {props.title}{props.durationText ? ` · ${props.durationText}` : ''}
        </span>
      )}
      <SourceFeedbackSlot feedback={props.feedback} />
    </div>
  );
}
