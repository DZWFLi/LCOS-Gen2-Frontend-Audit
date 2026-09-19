import { portalPreviewPresentation, type PortalPreviewVisualState } from './portalPreviewModel';

import type { ReactNode } from 'react';

import '../context/context-spatial.css';

export type { PortalPreviewVisualState } from './portalPreviewModel';

export interface PortalPreviewViewProps {
  readonly state: PortalPreviewVisualState;
  readonly title: string;
  /** Real provider detail is kept as accessible context; visual status copy follows Figma state matrix. */
  readonly detail?: string;
  readonly onOpen?: () => void;
  readonly onRetry?: () => void;
  readonly onZoom?: () => void;
  readonly children?: ReactNode;
}
export function PortalPreviewView({ state, title, detail, onOpen, onRetry, onZoom, children }: PortalPreviewViewProps): React.JSX.Element {
  const presentation = portalPreviewPresentation(state);
  return (
    <section
      data-lcos-portal-preview-view
      data-lcos-family="portal-preview"
      data-lcos-variant={state}
      data-state={state}
      className="lcos-portal-preview-view"
      aria-label={`${title} · ${presentation.footer}`}
      title={detail}
    >
      <strong className="lcos-portal-preview-title">{title}</strong>
      {onOpen ? (
        <button
          type="button"
          className="lcos-portal-open"
          onClick={onOpen}
          disabled={presentation.openDisabled}
        >
          打开现场
        </button>
      ) : null}
      <div className="lcos-portal-preview-stage" data-lcos-portal-stage={state}>
        {presentation.showsScene ? children : null}
        {!presentation.showsScene ? (
          <div className="lcos-portal-state-copy">
            <strong>{presentation.stageTitle}</strong>
            <span>{presentation.stageDetail}</span>
          </div>
        ) : null}
      </div>
      <span className="lcos-portal-footer-copy">{presentation.footer}</span>
      {presentation.showsRetry && onRetry ? (
        <button type="button" className="lcos-portal-retry" onClick={onRetry}>重试</button>
      ) : null}
      {presentation.showsZoom && onZoom ? (
        <button type="button" className="lcos-portal-zoom" onClick={onZoom}>放大预览</button>
      ) : null}
    </section>
  );
}
