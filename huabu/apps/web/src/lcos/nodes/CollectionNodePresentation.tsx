import { ContextCollectionView } from '../ui/context/ContextCollectionView';
import { WorkflowCollectionView } from '../ui/workflow/WorkflowCollectionView';
import './collection-node.css';

import type { PresentationDensity } from '@local-creative-os/web-gen2';
import type { CSSProperties, JSX } from 'react';

export interface CollectionNodePresentationProps {
  readonly kind: 'collection' | 'workflow-collection';
  readonly title: string;
  readonly density: PresentationDensity;
  readonly zoom?: number;
  readonly worldWidth?: number;
  readonly worldHeight?: number;
  readonly previewUrl?: string;
  readonly memberCount?: number;
  readonly memberLabels?: readonly string[];
  readonly members?: readonly { readonly type: 'artifact' | 'note' | 'collection' | 'scope' | 'workspace' | 'conversation' | 'run'; readonly id: string; readonly label: string }[];
  readonly onRemoveMember?: (memberRef: { readonly type: 'artifact' | 'note' | 'collection' | 'scope' | 'workspace' | 'conversation' | 'run'; readonly id: string }) => Promise<boolean>;
  readonly spaceAction?: JSX.Element;
  readonly action?: JSX.Element;
  readonly disabled?: boolean;
  readonly disabledReason?: string;
}

/** Keep Figma's 248×244 silhouette inside the existing Huabu geometry. */
export function collectionFaceScale(width = 248, height = 244): number {
  const w = Number.isFinite(width) && width > 0 ? width : 248;
  const h = Number.isFinite(height) && height > 0 ? height : 244;
  return Math.min(w / 248, h / 244);
}

export function CollectionNodePresentation({
  kind, title, density, zoom = 1, worldWidth, worldHeight, previewUrl, memberCount, memberLabels, members, onRemoveMember, spaceAction, action, disabled, disabledReason,
}: CollectionNodePresentationProps): JSX.Element {
  const fitScale = collectionFaceScale(worldWidth, worldHeight);
  const safeZoom = Number.isFinite(zoom) && zoom > 0 ? Math.max(0.1, zoom) : 1;
  const props = {
    title,
    rendition: '主画布' as const,
    ...(previewUrl === undefined ? {} : { previewUrl }),
    ...(action === undefined ? {} : { action }),
    ...(disabled === undefined ? {} : { disabled }),
    ...(disabledReason === undefined ? {} : { disabledReason }),
  };
  return <div className="lcos-node-collection" data-lcos-collection-density={density}
    data-lcos-collection-kind={kind}
    data-lcos-has-preview={previewUrl ? 'true' : 'false'}
    data-figma-node-id={kind === 'collection' ? '5333:96' : '5334:46'} title={title}>
    <div className="lcos-node-collection-fit" style={{
      '--lcos-collection-mark-scale': 1 / (fitScale * safeZoom),
      transform: `translate(-50%, -50%) scale(${fitScale})`,
    } as CSSProperties}>
      {kind === 'collection'
        ? <ContextCollectionView {...props} organization="未指定"
            memberSummary={memberCount === undefined ? '集合' : memberCount === 0 ? '空集合' : `${memberCount} 个成员`}
            hideEmptyPreviews
            {...(memberLabels === undefined ? {} : { memberLabels })}
            {...(members === undefined ? {} : { members })}
            {...(onRemoveMember === undefined ? {} : { onRemoveMember })}
            {...(spaceAction === undefined ? {} : { spaceAction })} />
        : <WorkflowCollectionView {...props} />}
    </div>
  </div>;
}
