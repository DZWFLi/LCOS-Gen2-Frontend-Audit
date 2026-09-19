import { useEffect, useState } from 'react';

import { AudioSourceView } from '../../ui/source/AudioSourceView';

import type { SourceMorphologyProps } from './sourceTypes';
import type { JSX } from 'react';

function formatDuration(seconds: number | undefined): string | undefined {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) {
    return undefined;
  }
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes.toString().padStart(2, '0')}:${rest.toString().padStart(2, '0')}`;
}

export function AudioSourceMorphology(props: SourceMorphologyProps): JSX.Element {
  const [mediaDurationSec, setMediaDurationSec] = useState<number | undefined>(
    props.durationSec,
  );
  useEffect(() => {
    setMediaDurationSec(props.durationSec);
  }, [props.durationSec, props.mediaSrc]);
  const duration = formatDuration(mediaDurationSec);

  return (
    <AudioSourceView
      {...props}
      durationText={duration}
      mediaMetadata={props.mediaSrc && (
        <audio
          data-lcos-audio-metadata
          src={props.mediaSrc}
          preload="metadata"
          aria-hidden="true"
          className="hidden"
          onLoadedMetadata={(event) => {
            const value = event.currentTarget.duration;
            if (Number.isFinite(value) && value > 0) setMediaDurationSec(value);
          }}
          onDurationChange={(event) => {
            const value = event.currentTarget.duration;
            if (Number.isFinite(value) && value > 0) setMediaDurationSec(value);
          }}
        >
          <track kind="captions" />
        </audio>
      )}
    />
  );
}
