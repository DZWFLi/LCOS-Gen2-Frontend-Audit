import { Network, PanelsTopLeft } from 'lucide-react';

import { PreviewMedia } from '../spatial/PreviewMedia';
import enterIcon from './assets/collection-enter.svg';
import thingIcon from './assets/context-thing.svg';
import timeIcon from './assets/context-time.svg';
import './context-spatial.css';

import type { PreviewMediaProps } from '../spatial/PreviewMedia';
import { useState } from 'react';
import type { ReactNode } from 'react';

export type ContextCollectionOrganization = '事情' | '时间' | '未指定';
export type ContextCollectionRendition = '总览' | '主画布' | '装配';
export type ContextAtlasVisualKind = 'collection' | 'scene' | 'context';

export interface ContextCollectionFaceProps {
  readonly title: string;
  readonly active?: boolean;
  /** Exact entity type from the existing producer, separate from organization semantics. */
  readonly sourceLabel?: string;
  readonly memberLabels?: readonly string[];
  readonly members?: readonly { readonly type: 'artifact' | 'note' | 'collection' | 'scope' | 'workspace' | 'conversation' | 'run'; readonly id: string; readonly label: string }[];
  readonly onRemoveMember?: (memberRef: { readonly type: 'artifact' | 'note' | 'collection' | 'scope' | 'workspace' | 'conversation' | 'run'; readonly id: string }) => Promise<boolean>;
  readonly spaceAction?: ReactNode;
  readonly memberSummary?: string;
  readonly hideEmptyPreviews?: boolean;
  readonly organization?: ContextCollectionOrganization;
  /** Canonical Warehouse kind; selects a truthful Atlas silhouette. */
  readonly atlasVisualKind?: ContextAtlasVisualKind;
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

function AtlasKindEmblem({ kind }: { readonly kind: Exclude<ContextAtlasVisualKind, 'collection'> }): React.JSX.Element {
  return <div className="lcos-context-atlas-emblem" aria-hidden="true" data-atlas-emblem={kind}>
    {kind === 'scene' ? <PanelsTopLeft size={30} strokeWidth={1.35} /> : <Network size={30} strokeWidth={1.35} />}
  </div>;
}

/**
 * Figma-derived face shared by the production Motion host and static visual regression.
 * Identity, membership, activation and attention remain inputs, not a second store.
 */
export function ContextCollectionFace({
  title, active = false, organization, atlasVisualKind = 'collection', rendition = '总览', previewUrl, secondaryPreviewUrl,
  previewFit, secondaryPreviewFit, disabled = false, disabledReason,
  action, onActivate, activationLabel, unspecifiedGlyph, sourceLabel,
  memberLabels,
  memberSummary,
  members,
  onRemoveMember,
  spaceAction,
}: ContextCollectionFaceProps): React.JSX.Element {
  const [memberActionError, setMemberActionError] = useState(false);
  const [membersExpanded, setMembersExpanded] = useState(false);
  const organizationLabel = organization === undefined
    ? undefined
    : organization === '未指定' ? '组织未标注' : `按${organization}组织`;
  const label = memberSummary ?? [sourceLabel, organizationLabel].filter((fact): fact is string => fact !== undefined).join(' · ');
  const hasRealCover = Boolean(previewUrl || secondaryPreviewUrl);
  return <>
    {onActivate && !disabled ? <button type="button" className="lcos-context-collection-hit"
      aria-label={activationLabel ?? `进入集合 · ${title}`}
      title={activationLabel ?? `进入集合 · ${title}`} onClick={onActivate} /> : null}
    <div className="lcos-context-collection-back" aria-hidden />
    <div className="lcos-context-collection-tab" aria-hidden />
    {previewUrl ? <div className="lcos-context-collection-cover cover-a">
      <PreviewMedia src={previewUrl} label={`${title} 封面`}
        {...(previewFit === undefined ? {} : { fit: previewFit })} />
    </div> : null}
    {secondaryPreviewUrl ? <div className="lcos-context-collection-cover cover-b">
      <PreviewMedia src={secondaryPreviewUrl} label={`${title} 第二份材料预览`}
        {...(secondaryPreviewFit === undefined ? {} : { fit: secondaryPreviewFit })} />
    </div> : null}
    {!hasRealCover && atlasVisualKind !== 'collection' ? <AtlasKindEmblem kind={atlasVisualKind} /> : null}
    <div className="lcos-context-collection-pocket-base" aria-hidden />
    <div className="lcos-context-collection-pocket" aria-hidden />
    {active ? <span className="lcos-context-collection-current">当前现场</span> : null}
    <div className="lcos-context-collection-copy">
      {organization !== undefined ? <span className="lcos-context-collection-icon" aria-hidden>
        {organization === '事情' ? <img src={thingIcon} alt="" draggable={false} />
          : organization === '时间' ? <img src={timeIcon} alt="" draggable={false} />
            : unspecifiedGlyph}
      </span> : null}
      <div><strong title={title}>{title}</strong>{label || disabled ? <span title={disabled ? disabledReason : label}>
        {disabled ? disabledReason ?? '目标当前不可用' : label}
      </span> : null}{memberLabels && memberLabels.length > 0 ? <span data-lcos-collection-member-labels title={memberLabels.join(' · ')}>{memberLabels.slice(0, 3).join(' · ')}</span> : null}
      {members && members.length > 0 && onRemoveMember ? <span data-lcos-collection-member-actions>
        {members.slice(0, membersExpanded ? undefined : 3).map((member) => <span key={`${member.type}:${member.id}`}>
          {member.label}<button type="button" aria-label={`从集合移除 ${member.label}`} title={`从集合移除 ${member.label}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => { event.stopPropagation(); void onRemoveMember({ type: member.type, id: member.id }).then((ok) => setMemberActionError(!ok)); }}>×</button>
        </span>)}
        {members.length > 3 ? <button type="button" aria-expanded={membersExpanded}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => { event.stopPropagation(); setMembersExpanded((value) => !value); }}>
          {membersExpanded ? '收起' : `展开其余 ${members.length - 3} 项`}
        </button> : null}
      </span> : null}</div>
    {memberActionError ? <span role="status">成员移除失败，集合内容未变</span> : null}
    </div>
    <div className="lcos-context-collection-action">{!disabled ? action : null}{spaceAction}</div>
    {rendition === '总览' ? <div className="lcos-context-collection-depth" aria-hidden /> : null}
  </>;
}
