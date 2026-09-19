import { Clock3, FolderOpen, Layers3 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import './context-spatial.css';

import type { ReactNode } from 'react';

export type ContextCollectionOrganization = '事情' | '时间' | '未指定';

export interface ContextCollectionViewProps {
  readonly title: string;
  readonly organization: ContextCollectionOrganization;
  readonly previewUrl?: string;
  readonly secondaryPreviewUrl?: string;
  readonly disabled?: boolean;
  readonly active?: boolean;
  readonly action?: ReactNode;
  /** Transitional selector for the current production/e2e contract. */
  readonly legacyAtlasKind?: string;
}

export function ContextCollectionView({
  title,
  organization,
  previewUrl,
  secondaryPreviewUrl,
  disabled = false,
  active = false,
  action,
  legacyAtlasKind,
}: ContextCollectionViewProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const Icon = organization === '时间' ? Clock3 : organization === '事情' ? FolderOpen : Layers3;
  const label = organization === '未指定' ? '组织未标注' : `按${organization}组织`;
  return (
    <motion.div
      data-lcos-family="collection-surface"
      data-lcos-organize={organization}
      data-lcos-rendition="总览"
      data-lcos-variant={active ? 'selected' : '总览'}
      {...(legacyAtlasKind === undefined ? {} : { 'data-lcos-atlas-card': legacyAtlasKind })}
      data-lcos-context-collection
      data-organization={organization}
      data-active={active ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className="lcos-context-collection"
      whileHover={reducedMotion || disabled ? undefined : { y: -5, scale: 1.018 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28, mass: 0.52 }}
    >
      <div className="lcos-context-collection-back" aria-hidden />
      <div className="lcos-context-collection-tab" aria-hidden />
      <div className="lcos-context-collection-cover cover-a" aria-hidden>
        {previewUrl ? <img src={previewUrl} alt="" draggable={false} /> : null}
      </div>
      <div className="lcos-context-collection-cover cover-b" aria-hidden>
        {secondaryPreviewUrl || previewUrl ? <img src={secondaryPreviewUrl ?? previewUrl} alt="" draggable={false} /> : null}
      </div>
      <div className="lcos-context-collection-pocket" aria-hidden />
      <div className="lcos-context-collection-copy">
        <Icon aria-hidden size={21} strokeWidth={1.7} />
        <div><strong>{title}</strong><span>{label}</span></div>
      </div>
      <div className="lcos-context-collection-action">{action ?? <span aria-hidden>↗</span>}</div>
      <div className="lcos-context-collection-depth" aria-hidden />
    </motion.div>
  );
}
