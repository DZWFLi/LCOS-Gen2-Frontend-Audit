import { useId } from 'react';

import { portalPreviewPresentation, type PortalPreviewVisualState } from './portalPreviewModel';
import '../context/context-spatial.css';

import type { ReactNode } from 'react';

export type { PortalPreviewVisualState } from './portalPreviewModel';

export interface PortalPreviewViewProps {
  readonly state: PortalPreviewVisualState;
  readonly title: string;
  /** Provider detail remains available to keyboard and assistive-technology users. */
  readonly detail?: string;
  readonly onOpen?: () => void;
  readonly onRetry?: () => void;
  readonly onZoom?: () => void;
  readonly children?: ReactNode;
}

export function PortalPreviewView({ state, title, detail, onOpen, onRetry, onZoom, children }: PortalPreviewViewProps): React.JSX.Element {
  const presentation = portalPreviewPresentation(state);
  const descriptionId = useId();
  const hasSceneSlot = children !== null && children !== undefined && children !== false;
  const showsScene = presentation.showsScene && hasSceneSlot;
  const showsRetry = presentation.showsRetry && onRetry !== undefined;
  const showsZoom = presentation.showsZoom && showsScene && onZoom !== undefined;
  return (
    <section
      data-lcos-portal-preview-view
      data-lcos-family="portal-preview"
      data-lcos-variant={state}
      data-state={state}
      data-has-retry={showsRetry ? 'true' : undefined}
      data-has-zoom={showsZoom ? 'true' : undefined}
      className="lcos-portal-preview-view"
      aria-label={`${title} · ${presentation.footer}`}
      aria-describedby={detail ? descriptionId : undefined}
      aria-busy={state === '加载中' || undefined}
      title={detail}
    >
      <div className="lcos-portal-preview-frame">
        <strong className="lcos-portal-preview-title" title={title}>{title}</strong>
        {onOpen ? <button
          type="button" className="lcos-portal-open" onClick={onOpen}
          disabled={presentation.openDisabled}
        >打开现场</button> : null}
        <div className="lcos-portal-preview-stage" data-lcos-portal-stage={state}>
          {showsScene ? children : <div className="lcos-portal-state-copy" role="status">
            <strong>{presentation.stageTitle ?? '预览内容尚未就绪'}</strong>
            <span>{detail ?? presentation.stageDetail ?? '保留目标身份，等待真实预览内容。'}</span>
          </div>}
        </div>
        <span className="lcos-portal-footer-copy" title={detail ?? presentation.footer}>{presentation.footer}</span>
        {showsRetry ? <button type="button" className="lcos-portal-retry" onClick={onRetry}>
          {state === '旧缓存' ? '重新读取' : '重试'}
        </button> : null}
        {showsZoom ? <button type="button" className="lcos-portal-zoom" onClick={onZoom}>放大预览</button> : null}
      </div>
      {detail ? <span id={descriptionId} className="lcos-portal-description">{detail}</span> : null}
    </section>
  );
}
