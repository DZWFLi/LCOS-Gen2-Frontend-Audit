import { PreviewMedia } from '../spatial/PreviewMedia';
import enterIcon from './assets/collection-enter.svg';
import thingIcon from './assets/context-thing.svg';
import timeIcon from './assets/context-time.svg';
import './context-spatial.css';

import type { PreviewMediaProps } from '../spatial/PreviewMedia';
import type { ReactNode } from 'react';

export type ContextCollectionOrganization = '事情' | '时间' | '未指定';
export type ContextCollectionRendition = '总览' | '主画布' | '装配';

export interface ContextCollectionFaceProps {
  readonly title: string;
  readonly organization: ContextCollectionOrganization;
  readonly rendition?: ContextCollectionRendition;
  readonly previewUrl?: string;
  readonly secondaryPreviewUrl?: string;
  readonly previewFit?: PreviewMediaProps['fit'];
  readonly secondaryPreviewFit?: PreviewMediaProps['fit'];
  readonly disabled?: boolean;
  readonly disabledReason?: string;
  readonly action?: ReactNode;
  readonly onActivate?: () => void;
  readonly activationLabel?: string;
  /** Supplied by the existing host; not an inferred organization. */
  readonly unspecifiedGlyph?: ReactNode;
}

/** Exact Figma-exported Noto Sans SC arrow glyph; the original text node line box is 20×23. */
export function ContextCollectionActionGlyph(): React.JSX.Element {
  return <img src={enterIcon} width={11} height={11} alt="" draggable={false} />;
}

/**
 * Figma-derived face shared by the production Motion host and static visual regression.
 * Identity, membership, activation and attention remain inputs, not a second store.
 */
export function ContextCollectionFace({
  title, organization, rendition = '总览', previewUrl, secondaryPreviewUrl,
  previewFit, secondaryPreviewFit, disabled = false, disabledReason,
  action, onActivate, activationLabel, unspecifiedGlyph,
}: ContextCollectionFaceProps): React.JSX.Element {
  const label = organization === '未指定' ? '组织未标注' : `按${organization}组织`;
  return <>
    {onActivate && !disabled ? <button type="button" className="lcos-context-collection-hit"
      aria-label={activationLabel ?? `进入集合 · ${title}`} onClick={onActivate} /> : null}
    <div className="lcos-context-collection-back" aria-hidden />
    <div className="lcos-context-collection-tab" aria-hidden />
    <div className="lcos-context-collection-cover cover-a">
      <PreviewMedia src={previewUrl} label={`${title} 封面`}
        {...(previewFit === undefined ? {} : { fit: previewFit })} />
    </div>
    <div className="lcos-context-collection-cover cover-b">
      <PreviewMedia src={secondaryPreviewUrl} label={`${title} 第二份材料预览`}
        {...(secondaryPreviewFit === undefined ? {} : { fit: secondaryPreviewFit })} />
    </div>
    <div className="lcos-context-collection-pocket-base" aria-hidden />
    <div className="lcos-context-collection-pocket" aria-hidden />
    <div className="lcos-context-collection-copy">
      <span className="lcos-context-collection-icon" aria-hidden>
        {organization === '事情' ? <img src={thingIcon} alt="" draggable={false} />
          : organization === '时间' ? <img src={timeIcon} alt="" draggable={false} />
            : unspecifiedGlyph}
      </span>
      <div><strong title={title}>{title}</strong><span title={disabled ? disabledReason : label}>
        {disabled ? disabledReason ?? '目标当前不可用' : label}
      </span></div>
    </div>
    <div className="lcos-context-collection-action">{!disabled ? action : null}</div>
    {rendition === '总览' ? <div className="lcos-context-collection-depth" aria-hidden /> : null}
  </>;
}
